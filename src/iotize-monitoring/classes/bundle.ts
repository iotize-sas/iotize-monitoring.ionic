import { Variable } from './variable'
export class Bundle {
        id: number;
        name: string;
        variables: Variable[] = [];
        rights: {
                profile: string,
                read: boolean,
                write: boolean
        }[];

        /**
         * Checks if current bundle can be seen by the current user
         * @param {string} profile name of the profile 
         * @returns {boolean} true if bundle is visible to the user
         */

        isVisibleTo(profile: string) {
                let isVisible;

                switch (profile) {
                        case 'admin':
                        return true;

                        case 'supervisor':
                        return (this.rights.length !== 1 || this.rights.find( right => right.profile === 'admin') === undefined);

                        default :
                        isVisible = this.rights.find( right => right.profile === profile? true : right.profile === 'anonymous');
                } 
                return isVisible !== undefined ? true : false;
        }

        /**
         * Checks if current bundle can be written by the current user
         * @param profile name of the profile
         * @returns {boolean} true if bundle is writable by the user
         */
        isWritableBy(profile: string) {

                switch (profile) {
                        case 'admin':
                        return this.rights.find(right => right.write) !== undefined;
                        
                        case 'supervisor':
                        return this.rights.find(right => (right.write && right.profile !== 'admin')) !== undefined;

                        default :
                        const profileRights = this.rights.find( right => right.profile === profile);
                        const anonymousRights = this.rights.find( right => right.profile === 'anonymous');

                        return (profileRights && profileRights.write)? true : (anonymousRights && anonymousRights.write)? true : false;
                } 

        }
}