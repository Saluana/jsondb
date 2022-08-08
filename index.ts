import fs from "fs"
import AES from "crypto-js/aes"
import Utf8 from "crypto-js/enc-utf8"
const fsPromises = fs.promises

export default interface KVQuery {
    key: string;
    value: any;
}

export default class JsonDB {
    readonly name: string;
    readonly path: string = './db';

    constructor(DBname: string, filePath?: string) {
          this.name = DBname;
          if (filePath !== undefined) {
                this.path = filePath;
            }
      }

    private async parse (json: string): Promise<any> {
        if (json.length > 0 && ( (json.includes('":') && json.includes('{"')) || ( json.includes('["') && json.includes('"]') ) )) {
            try {
              return JSON.parse(json as any)
            } catch (error) {
                Promise.reject("Invalid JSON")
            }
        }
    }

    public async createDB ( ): Promise<void> {
        let dbName = this.name;

        if (!fs.existsSync(this.path)) {
            await fsPromises.mkdir(this.path, { recursive: true });
        }

        try {
        await fsPromises.writeFile(`${this.path}/${dbName}.json`, JSON.stringify({}))
        return Promise.resolve()
        } catch (error) {
            console.log(error)
            return Promise.reject(error)
        }
    }

    public async listDBs (): Promise<any> {
        const files = await fsPromises.readdir(this.path)
        const fileNames = files.map(file => {
            return file.split(".")[0]
        })
        return fileNames
    }

    public async addEntry ( data: KVQuery): Promise<any> {
        if (!data.key) {
            return Promise.reject("No key provided")
        } else if (!data.value) {
            return Promise.reject("No value provided")
        }

        let dbName = this.name;
        const db = await fsPromises.readFile(`${this.path}/${dbName}.json`)
        const dbData = JSON.parse(db.toString())

        if (dbData[data.key]) {
        return Promise.reject(`Key "${data.key}" already exists in DB`);
        } else {
        dbData[data.key] = data.value
        await fsPromises.writeFile(`${this.path}/${dbName}.json`, JSON.stringify(dbData))
        return Promise.resolve(dbData) 
        }
    }

    public async getEntry ( key: string): Promise<any> {
        if (!key) {
            return Promise.reject("No key provided")
        }

        let dbName = this.name;
        const db = await fsPromises.readFile(`${this.path}/${dbName}.json`, "utf8")
        let dbData = JSON.parse(db)

        if (!dbData.hasOwnProperty(key)) {
            return Promise.reject(`Key "${key}" does not exist in DB`)
        }

        try {
        var data = await this.parse(dbData[key])
        if ( data ) {
            return Promise.resolve(data)
        }
        } catch (error) {
            console.log(error)
        }
        
        return Promise.resolve(dbData[key])
    }

    public async removeEntry ( key: string): Promise<any> {

        if (!key) {
            return Promise.reject("No key provided")
        }

        let dbName = this.name;
        const db = await fsPromises.readFile(`${this.path}/${dbName}.json`, "utf8")
        let dbData = JSON.parse(db)

        if (!dbData.hasOwnProperty(key)) {
            return Promise.reject(`Key "${key}" does not exist in DB`)
        }

        delete dbData[key]
        await fsPromises.writeFile(`${this.path}/${dbName}.json`, JSON.stringify(dbData))
        return Promise.resolve(dbData)
    }

    public async updateEntry ( data: KVQuery): Promise<any> {
        if (!data.key) {
            return Promise.reject("No key provided")
        } else if (!data.value) {
            return Promise.reject("No value provided")
        }

        let dbName = this.name;
        const db = await fsPromises.readFile(`${this.path}/${dbName}.json`, "utf8")
        let dbData = JSON.parse(db)

        if (!dbData.hasOwnProperty(data.key)) {
            return Promise.reject(`Key "${data.key}" does not exist in DB`)
        }

        dbData[data.key] = data.value
        await fsPromises.writeFile(`${this.path}/${dbName}.json`, JSON.stringify(dbData))
        return Promise.resolve(dbData)
    }

    public async getAllByValue ( value: any): Promise<any> {
        if (!value) {
            return Promise.reject("No value provided")
        }
        let dbName = this.name;
        const db = await fsPromises.readFile(`${this.path}/${dbName}.json`, "utf8")
        let dbData = JSON.parse(db)

        let keys = Object.keys(dbData)
        let filteredKeys = keys.filter(key => {
            return dbData[key] === value
        }).map(key => {
            return {key: key, value: dbData[key]}
        }).sort()
        return Promise.resolve(filteredKeys)
    }

    public async encrypt ( encryptionKey: string): Promise<any> {

        if (!encryptionKey) {
            return Promise.reject("No encryption key provided")
        }

        let dbName = this.name;
        const db = await fsPromises.readFile(`${this.path}/${dbName}.json`, "utf8")
        try {
        var dbData = JSON.parse(db)
        } catch (error) {
            console.log(error)
            return Promise.reject("DB is already encrypted")
        }
        let encrypted = AES.encrypt(JSON.stringify(dbData), encryptionKey).toString()
        await fsPromises.writeFile(`${this.path}/${dbName}.json`, encrypted)
        return Promise.resolve(encrypted)
    }
    
    public async decrypt ( encryptionKey: string): Promise<any> {
        if (!encryptionKey) {
            return Promise.reject("No encryption key provided")
        }
        let dbName = this.name;
        const db = await fsPromises.readFile(`${this.path}/${dbName}.json`, "utf8")
        try {
           const jsonCheck = JSON.parse(db)
           if ( jsonCheck ) {
              return Promise.reject("DB is not encrypted")
           }
        } catch (error) {
            console.log(error)
        }
        let dbData = AES.decrypt(db, encryptionKey).toString(Utf8)
        await fsPromises.writeFile(`${this.path}/${dbName}.json`, dbData)
        return Promise.resolve(dbData)
    }
}

