## eMigrate Project

This is project introduce to node application with http server and express framework under moleculer engine

## Installation

With npm installed (comes with [node](https://nodejs.org/en/)), run the following commands into a terminal in the root directory of this project:

```shell
npm install
npm run build
npm run start
```

## How To Install
This project need [@willsofts](https://github.com/willsofts) libraries to run that is private access, then you have to gain access key from administrator and setting in your own environment before start installation. \
ex. \
Window

    set NPM_TOKEN=your access token key here

Linux

    export NPM_TOKEN=your access token key here


The project will run at http://localhost:8080/

## Setup
Since this project required database setup before starting you have to create database schema by run sql file under folder `/database/assuredb_mysql.sql` this sql snippet file come with MySQL. Example user access existing in `/database/readme.txt`.

## Configuration
After setup database you may change configuration setting to access your database by `/config/default.json`. see more detail [will-sql](https://github.com/willsofts/will-sql)

In case of setting http connection especially port (default at 8080) can be config by `/config/default.json` or environment setting in command prompt \
ex. \
Window 

    set HTTP_PORT=8888 

Linux 

    export HTTP_PORT=8888 

To disable validate token in development mode you can setting environment or change `/config/default.json` before start up project 

    set VALIDATE_TOKEN=false

or
    
    export VALIDATE_TOKEN=false

## Example

This project contains examples API that it can invoke by [curl](https://curl.se/download.html):

* curl http://localhost:8080/api/fetch/hello 
* curl http://localhost:8080/api/fetch/hello?name=test  (query parameter)
* curl -X POST http://localhost:8080/api/fetch/hello -d name=test  (post parameter)
* curl -X POST -H "Content-Type: application/json" "http://localhost:8080/api/fetch/hello" -d "{\"name\":\"testing\"}"
* curl http://localhost:8080/api/fetch/hi/test (RESTful api with path parameter)
* curl -v http://localhost:8080/api/fetch/error (with http status 500)
* curl -X POST http://localhost:8080/api/fetch/time/current (RESTful api return current time milliseconds)

## Features

#### Migrate Data

1. Direct entry.
This is a simple data entry.

2. Mapper fields.
This is a customize and complex data entry.

3. Handler function.
This is a custom function handler.

4. Default values.
This is a reserved entities for default values.

5. Support API fetching.
This is an external data from calling API.

6. Support Database gathering.
This is a external data from execute query via data base connection.


## Database Connection String

| Vendor | Example |
| -------- | ----------- |
| MSSQL | Server=localhost,1433;Database=refdb;User Id=sa;Password=sapassword;Encrypt=false;Trusted_Connection=Yes; |
| ORACLE | localhost:1521/ORCLCDB.localdomain |
| POSTGRES | postgresql://postgres:root@localhost:5432/testdb |
| ODBC | DRIVER={MySQL ODBC 8.0 Unicode Driver};SERVER=localhost;DATABASE=testdb;HOST=localhost;PORT=3306;UID=root;PWD=root; |

