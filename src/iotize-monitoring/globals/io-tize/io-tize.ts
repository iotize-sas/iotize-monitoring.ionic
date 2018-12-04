import { Injectable } from '@angular/core';
import { IoTizeDevice } from '@iotize/device-client.js/device';
import { ConfigProvider } from '../config/config';
import { ComProtocol } from '@iotize/device-client.js/protocol/api';
import { Variable } from '../../classes/variable';
import { Bundle } from '../../classes/bundle';
import { VariableMonitorOptions } from '@iotize/device-client.js/device/target-variable/monitor/variable-monitor.interface';
import { Events } from 'ionic-angular';
import { Subscription } from 'rxjs';

/*
  Generated class for the IoTizeProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
  */
@Injectable({
  providedIn: 'root'
})
export class IoTizeProvider {

  SN = "";
  currentHostProtocol = "";
  currentUser = "";
  device: IoTizeDevice;
  connectionPromise: Promise<void>;
  monitoredVariables = new Array<string>();
  isReady: boolean = false;

  // Subscription map for monitor.stop() as it doesn't complete the observable yet.

  monitoringSubscriptions: Map<string, Subscription> = new Map();

  /** Default values for the monitoring options :
   * @param {boolean} forceChange force IoTize device to refresh the data, whether it has changed or not
   * @param {number} duration set the monitoring duration. -1 stands for no duration limitation
   * @param {number} period period of the monitoring refresh
   */

  private monitoringConfig: VariableMonitorOptions = {
    forceChange: true,
    duration: -1,
    period: 500
  };

  constructor(public configProvider: ConfigProvider,
    public events: Events) {
  }

  /**
   * Instantiate and initialize IoTizeDevice object with a connection protocol,
   * then get IoTize configuration from .iotz file specified by the device,
   * then register all variables.
   * @param {ComProtocol} protocol Communcation protocol used to connect to device
   */

  async init(protocol: ComProtocol) {
    this.isReady = false;
    let configPath;
    try {
      await this.clear();
      this.device = IoTizeDevice.create();
      console.log('device created');

      this.connectionPromise = this.connect(protocol);
      console.log('waiting for connection promise');
      await this.connectionPromise;

      //Configuration recovering
      this.events.publish('connection:pending', 'Reading Serial Number');
      console.log('getting SN');
      this.SN = await this.getSerialNumber();

      this.events.publish('connection:pending', 'Reading Configuration location');
      configPath = await this.getConfigPath();
      console.log("_____________ Config path: " + configPath);
    } catch (error) {
      console.error("init failed")
      console.error(error)
      throw error;
    }
    
    try {
      this.events.publish('connection:pending', 'Downloading Configuration');
      await this.configProvider.getConfig(configPath); // Gets the local config file (testing purposes)
    } catch (error) {
      throw new Error("Can't get configuration file");
    }

    try {

      this.setAllVariables();
      
      this.events.publish('connection:pending', 'Reading Host Protocol');
      this.currentHostProtocol = await this.getCurrentHostProtocol();

      this.events.publish('connection:pending', 'Reading Username');
      this.currentUser = await this.getCurrentUserName();

      this.events.publish('user:changed');
      this.isReady = true;
    } catch (error) {
      console.error("init failed")
      console.error(error)
      throw new Error("Connection Failed");
    }
  }
  /**
   * connects to device
   * @param {ComProtocol} protocol Communcation protocol used to connect to device
   * @return {Promise<void>} Promise resolved if connected, rejected otherwise
   */

  connect(protocol?: ComProtocol): Promise<void> {
    return this.device.connect(protocol);
  }
  /**
   * Disconnects from current device
   * @return {Promise<void>}
   */

  disconnect(): Promise<void> {
    return this.device.disconnect();
  }
  /**
   * get Serial Number from device
   * @return {Promise<string>}
   */

  async getSerialNumber(): Promise<string> {
    try {
      console.log('getting Serial Number');
      return (await this.device.service.device.getSerialNumber()).body();

    } catch (exception) {
      console.error(exception);
      throw new Error("GetSerialNumber failed");
    }
  }

  /**
   * get informations about current host protocol
   * @return {Promise<string>} promise on the username string
   */

  async getCurrentHostProtocol(): Promise<string> {
    try {
      return (await this.device.service.interface.getCurrentHostProtocol()).body();
    } catch (exception) {
      console.error(exception);
    }
  }

  /**
   * Gets the id of the currently logged user
   * @return {Promise<number>} promise on the id number
   */

  async getCurrentUserId(): Promise<number> {
    try {
      return (await this.device.service.interface.getCurrentProfileId()).body();
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Gets the name of the currently logged user
   * @return {Promise<string>} promise on the username string
   */

  async getCurrentUserName(): Promise<string> {
    try {
      const id = await this.getCurrentUserId();
      return this.configProvider.getUserName(id);
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Gets informations about device config version
   * @return {Promise<string>}
   */

  async getConfigVersion(): Promise<string> {
    try {
      return (await this.device.service.interface.getConfigVersion()).body();
    } catch (exception) {
      console.error(exception);
    }
  }

  /**
   * Registers all variables declared in the configuration file, parsed in the ConfigProvider
   * @return {void}
   */

  setAllVariables(): void {
    this.configProvider.bundles.forEach((bundle) => {
      this.setAllBundleVariables(bundle);
    });
  }

  /**
   * Registers all variables from a bundle
   * @param {Bundle} bundle
   * @return {void}
   */

  private setAllBundleVariables(bundle: Bundle): void {
    bundle.variables.forEach((variable) => {
      this.setVariable(variable);
    });
  }

  /**
   * Registers one variable
   * @param {Variable} variable - variable to be registered
   * @return {void}
   */

  private setVariable(variable: Variable): void {
    this.device.variables.add(variable.name,
      this.configProvider.variableConfigArray.find(
        variableConfig => variable.id === variableConfig.id));
  }

  /**
   * Writes a value inside the device variable
   * @param variable - variable to modify
   * @param value - value to write
   * @return {void}
   */

  public setVariableValue(variable: Variable, value): Promise<void> {
    return this.device.variables.get(variable.name).write(value);
  }

  /**
   * Launches monitoring for every variable inside the specified bundle
   * @param {Bundle} bundle
   * @return {void}
   */

  public monitorVariablesFromBundle(bundle: Bundle): void {
    bundle.variables.forEach((variable) => this.monitorVariable(variable));
  }

  /**
   * Launches monitoring for one specified variable
   * @param {Variable} variable
   * @return {void}
   */

  public monitorVariable(variable: Variable): void {
    this.monitoringSubscriptions.set(variable.name,
      this.device.variables.get(variable.name)
        .monitor()
        .start(this.monitoringConfig)
        .values()
        .subscribe({
          next(value: number) {
            console.log("value of " + variable.name + ": " + value);
            variable.value = value.toString()
          }
        })
    );
    this.monitoredVariables.push(variable.name);

  }

  /**
   * Launches monitoring for all variables specified in the configProvider
   * @return {void}
   */

  public monitorAll(): void {
    this.configProvider.getBundles().forEach(
      (bundle) =>
        this.monitorVariablesFromBundle(bundle));
  }

  /**
   * Stops the monitoring of the specified variable, removes it from the monitoredVariables array, unsubscribes from
   * its monitoring obseervable and deletes it from the monitoringSubscription map
   * @param {string} variableName
   * @return {void}
   */
  public stopMonitoring(variable: string | Variable) {
    const variableName = typeof variable === 'string' ? variable : variable.name;
    this.device.variables.get(variableName)
      .monitor()
      .stop();
    this.monitoringSubscriptions.get(variableName).unsubscribe();
    this.monitoringSubscriptions.delete(variableName);
    this.monitoredVariables.splice(
      this.monitoredVariables.findIndex(value => value == variableName), 1);
  }

  /**
   * Stops monitoring for every variable
   * @return {void}
   */
  public stopAllMonitoring(): void {
    while (this.monitoredVariables.length > 0) {
      this.stopMonitoring(this.monitoredVariables[0]);
    }
  }

  /**
   * Tries to login the device, refresh currentUser property and publish an event "user:changed"
   * @param {string} userName
   * @param {string} password 
   */

  public async login(userName: string, password: string) {
    await this.device.login(userName, password);
    this.currentUser = await this.getCurrentUserName();
    this.events.publish('user:changed');
  }

  /**
   * Tries to logout from the device, refresh currentUser and publish an event "user:changed"
   */

  public async logout() {
    await this.device.logout();
    console.log('logged out');
    this.currentUser = await this.getCurrentUserName();
    this.events.publish('user:changed');
  }

  /**
   * Stops all monitoring and clears every properties. Also clears configProvider
   */

  public async clear() {
    if (!!this.monitoredVariables[0]) this.stopAllMonitoring();
    if (this.device) await this.disconnect();
    this.device = null;
    this.connectionPromise = null;
    this.currentHostProtocol = "";
    this.SN = "";
    this.monitoredVariables = [];
    this.currentUser = "";
    this.isReady = false;
    this.configProvider.clear();

  }

  /**
   * Sets monitoring configuration.
   * @param {VariableMonitorOptions} config
   */

  public setMonitoringConfig(config: VariableMonitorOptions) {
    this.monitoringConfig = config;
  }

  /**
   * Gets stored monitoring configuration
   */
  public getMonitoringConfig() {
    return this.monitoringConfig;
  }

  public async getAppPath(): Promise<string> {
    let appPath;
    try {
      appPath = (await this.device.service.interface.getAppPath()).body();
    }
    catch (error) {
      console.error('IoTizeProvider',JSON.parse(error));
      throw new Error('Can\'t get AppName');
    }
    const baseUrl = "http://user.cloud.iotize.com/users/";

    console.log("__________ appPath: " + appPath);

    const prefix = appPath.split('/')[0];
    let prefixLessAppPath = appPath.replace(prefix + '/', '').replace(/.html/, '.cloud');

    switch (prefix) {
      case "$1":
      return baseUrl + prefixLessAppPath;

      case "$2":
      return "http://" + prefixLessAppPath;

      case "$6":
      return baseUrl + prefixLessAppPath;

    }
    console.error("_______ " + appPath);
    throw new Error("getAppPath Error, AppPath doesn't correspond to any IoTize formatted one");
  }

  public async getConfigPath(): Promise<string> {
    // const ConfigPath = await this.getAppPath(); 
    console.log('getting config file path');
    const ConfigPath = await this.getAppPath(); // first testing purposes

    return ConfigPath;
  }
}


