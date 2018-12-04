import { Injectable } from '@angular/core';
import { Variable } from '../../classes/variable';
import { Bundle } from '../../classes/bundle';
import { VariableConfigPredefined } from '@iotize/device-client.js/device/target-variable/config/variable-config';
import { VariableConfigHelper } from './variable-config-helper';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Events, Platform } from 'ionic-angular';
import { HTTP } from '@ionic-native/http';

/*
  Generated class for the ConfigProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable({
  providedIn: 'root'
})
export class ConfigProvider {
  
  private xmlString: string;
  appName: string;
  private configXML: Document;
  private bundlesArray;
  public bundles: Bundle[];
  variableConfigArray: VariableConfigPredefined[];
  configMQTT: Object;
  serialNumber: string;

  constructor(public angularHttpClient: HttpClient,
              public ionicHttpClient: HTTP,
              private platform: Platform,
              public events: Events
              ) {
   }

   /**
    * get XML Configuration file as a string
    * @param {string} url URL where you can find IoTize .cloud configuration file
    * @return {Promise<void>}
    */

   private async getXMLString(url: string): Promise<void> {

    const headers = new HttpHeaders({
      'Content-Type': 'text/xml',
      'Accept': 'text/xml'
    });

    
    try{
      console.log("trying to get XML");
      this.xmlString = await this.get(url, headers);
      console.log('xmlString OK');
    } catch (e) {
      console.log(e);
    }
  }

  /**
   * creates a browsable DOM element from the previously fetched string,
   * making it easier to parse
   * @return {void}
   */

  private createConfigXML(): void{
    const parser = new DOMParser();
    this.configXML = parser.parseFromString(this.xmlString, 'application/xml');
    console.log('XMLString Parsed');
    console.log(this.configXML);
  }

  /**
   * creates an array of browsable bundle elements
   * @return {void}
   */
  private createBundlesArray(): void{
      this.bundlesArray =this.configXML.getElementsByTagName('IOTizeConfiguration')[0]
                          .getElementsByTagName('IOTizeBundle');
  }

  /**
   * returns the array of Bundle object
   * @return {Bundle[]}
   */

  getBundles(): Bundle[]{
    return this.bundles;
  }

  /**
   * converts the browsable bundle elements to an array of bundle object
   * @return {Bundle[]}
   */

  private convertXMLBundlesToBundleArray(): Bundle[]{
    let array = [];
    for (let i = 0; i < this.bundlesArray.length; i++) {

      let bundle:Bundle = new Bundle();
      bundle.id = +this.bundlesArray[i].getAttribute('Id');
      bundle.name = this.bundlesArray[i].getAttribute('GUI_Name');
      bundle.variables = this.convertIOTizeVariableToVariableArray(this.bundlesArray[i].getElementsByTagName('IOTizeVariable'));
      bundle.rights = [];

      const iotizeACL = this.bundlesArray[i].getElementsByTagName('IOTizeACL')
      
      for(let i = 0; i < iotizeACL.length; i++) {
        let profile = iotizeACL[i].getAttribute('ProfileName');
        let rights: string = iotizeACL[i].getAttribute('Rights');
        
        bundle.rights.push({
          profile: profile,
          read: rights.includes('read'),
          write: rights.includes('write')
        });
      }

      array.push(bundle);
    }
    return array;
  }

  /**
   * converts the browsable variable elements into an array of Variable objects
   * @param IOTizeVariableTags
   * @return {Variable[]}
   */

  private convertIOTizeVariableToVariableArray(IOTizeVariableTags): Variable[] {
    let result = [];
    for (let i = 0; i < IOTizeVariableTags.length; i++) {
      let variable: Variable = new Variable();
      variable.id = +IOTizeVariableTags[i].getAttribute('Id');
      variable.name = IOTizeVariableTags[i].getAttribute('GUI_Name');
      variable.alias = IOTizeVariableTags[i].getAttribute('GUI_Alias')? IOTizeVariableTags[i].getAttribute('GUI_Alias') : variable.name;
      variable.unit = IOTizeVariableTags[i].getAttribute('GUI_DispUnit');
      variable.updatable = IOTizeVariableTags[i].getAttribute('GUI_Submit') == "Yes"? true: false;
      variable.value = "";

      const unitSize = +IOTizeVariableTags[i].getAttribute('Unit');
      const float = (IOTizeVariableTags[i].getAttribute('GUI_float') &&
                    +IOTizeVariableTags[i].getAttribute('GUI_float') == 1)? true: false;

      const signed = (IOTizeVariableTags[i].getAttribute('GUI_unsigned') &&
                      +IOTizeVariableTags[i].getAttribute('GUI_unsigned') != 1)? true: false;
      variable.type= {
        float: float,
        signed: signed,
        size: VariableConfigHelper.UnitSizeMap[unitSize]
      }
      result.push(variable);

      this.variableConfigArray.push({
        id: variable.id,
        converter: VariableConfigHelper.getConverter(unitSize, signed, false, float)
      });
    }
    return result;
  }

  /**
   * gets the configuration file and creates every config element accordingly
   * @param {string} url - URL where you can find iotz configuration file
   * @return {Promise<void>}
   */

  public async getConfig(url: string): Promise<void> {
    try{

      this.events.publish('connection:pending', 'Downloading configuration');
      
      this.variableConfigArray = [];
      await this.getXMLString(url);
      
      this.events.publish('connection:pending', 'Reading configuration');
      
      this.createConfigXML();
      this.getAppName();
      this.getSN();
      this.createBundlesArray();
      this.bundles = this.convertXMLBundlesToBundleArray();
      this.getMQTTConfig();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  /**
   * gets the MQTT connection informations stored in the configuration file
   * and saves them inside the provider
   */
  private getMQTTConfig(): void{
    this.configMQTT = {};
    this.configMQTT['hostName'] = this.configXML.getElementsByTagName('CloudHostName')[0]?
    this.configXML.getElementsByTagName('CloudHostName')[0].getAttribute('Name'):'No MQTT host';
    this.configMQTT['serviceName'] = this.configXML.getElementsByTagName('CloudServiceName')[0]?
    this.configXML.getElementsByTagName('CloudServiceName')[0].getAttribute('Name'):'No Service name';
    this.configMQTT['UID'] = this.configXML.getElementsByTagName('CloudMQTT_UID')[0]?
    this.configXML.getElementsByTagName('CloudMQTT_UID')[0].getAttribute('Name'):'No UID';
  }

  /**
   * gets the serial number from the configuration file, stores it inside the provider
   */
  
  private getSN(){
    this.serialNumber = this.configXML.getElementsByTagName('IOTizeApp')[0].getAttribute('DevIoTizeSN');
    console.log('Serial Number retrieved');
  }
  
    /**
     * gets the serial number from the configuration file, stores it inside the provider
     */
  
  private getAppName() {
    this.appName = this.configXML.getElementsByTagName('IOTizeApp')[0].getAttribute('Name');
    console.log('AppName retrieved');
  }

  /**
   * gets a username from the user's id
   * @param {number} id
   * @return {string}
   */

  getUserName(id: number): string {
    const profiles = this.configXML.getElementsByTagName('IOTizeProfile');

    for (let i=0; i< profiles.length; i++) {
      if (+(profiles[i].getAttribute('Id')) == id) return profiles[i].getAttribute('Name');
    }
  }

  /**
   * finds and returns the Bundle object with the corresponding id
   * @param {number} id
   * @return {Bundle}
   */

  getBundleById(id: number): Bundle {
    const bundle = this.bundles.find(bundle => bundle.id == id);
    return bundle;
  }

  /**
   * Loads data from the configuration document and stores it
   * @param {Document} xmlFile
   * @return {void}
   */

  public getConfigFromUploadedFile(xmlFile: Document): void {
    console.log('trying to parse the following document');
    console.log(xmlFile);
    this.variableConfigArray = [];
    this.configXML = xmlFile;
    this.createConfigXML();
    this.getAppName();
    this.getSN();
    this.createBundlesArray();
    this.bundles = this.convertXMLBundlesToBundleArray();
    this.getMQTTConfig();
  }

  /**
   * Unloads the provider
   */

  public clear() {
    this.xmlString = null;
    this.appName = null;
    this.configXML = null;
    this.bundlesArray = null;
    this.bundles = null;
    this.variableConfigArray = null;
    this.configMQTT= null;
    this.serialNumber = null;
  }

  /**
   * Returns true if the provided profile has writing rights on the provided bundle
   * @param {string} profile
   * @param {number} bundleId
   * @return {boolean}
   */

  profileCanUpdate(profile: string, bundleId: number): boolean {
    const myBundle = this.getBundleById(bundleId);
    
    return myBundle.isWritableBy(profile);
  }

  /**
   * Gets a file from an URL and returns it as a string
   * @param {string} url downloadable file location
   * @param {HttpHeaders} headers headers to add to the HTTP request
   * @return {Promise<string>} 
   */

  async get(url: string, headers?: HttpHeaders): Promise<string> {

    if (this.platform.is('ios')) {
      console.log("####### Using ionicHttpClient ");
      try {
        const response = await this.ionicHttpClient.get(url, {} , {});
        console.log(response.data);
        return response.data;
      } catch (e) {
        console.error(e);
      }
    }
    return (await this.angularHttpClient.get(url, {responseType: "text", headers: headers}).toPromise());
  }
}