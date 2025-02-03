# Portfolio Website v2.0
This project uses [Angular CLI](https://github.com/angular/angular-cli).

## Local Development Instructions
### **Prerequisites**
Versions:
- Angular CLI: 17.3.8
- Node: 20.10.0
- Package Manager: npm 10.2.3

Before running the project, ensure you have the following installed:
- **Node.js** (v20.10.0) → [Download](https://nodejs.org/)
- **npm** (v10.2.3) → Comes with Node.js  

### Installation
**Clone the Repository:**
```sh
git clone https://github.com/syuhas/websitev2.git
cd websitev2
```

**Install Dependencies**
```sh
npm install
```
> Note: This project uses a customized script and style from from the base [PrismJS](https://github.com/PrismJS/prism) package to mimic VSCode highlighting for Python (`npm install @syuhas22/prismjs`)
> Backup custom styles can be found in ./deploy/prism_custom/

**Check Version Against Listed Versions**
```sh
npx ng version
```
...or if CLI is installed globally...
```sh
ng version
```
**Running the Development Server**
Run for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.
```sh 

``` 
```sh
npx ng serve
```
...or if CLI is installed globally...
```sh
ng serve
```

### Building and Deploying
- Before deploying to production server, this project is configured to be packaged locally before deployment.
- After packaging, all files from the `/dist` directory can be used for deployment.

```sh
```sh
npx ng build --configuration production
```
...or if CLI is installed globally...
```sh
ng build --configuration production
```

- This project is configured to be deployed with Jenkins to Docker on EC2 with custom SSL certificates.

- The API is served with a reverse proxy on the same server with custom SSL certificates from LetsEncrypt.

- Edit `deploy/docker/default.conf` and `deploy/docker/Jenkinsfile` to update domain name this will run from

- Current certs allow for `www.digitalsteve.net` and `digitalsteve.net`

- Infrastructure is deployed via Terraform. Ensure Terraform is installed on build server to provision resources with appropriate roles as defined in the Jenkinsfile ROLE_NAME parameter

### TroubleShooting
If you run into issues installing running, some things to try:

- Try clearing the cache:
```sh
npm cache clean --force
```
- Delete and reinstall dependencies:
```sh
rm -rf node_modules package-lock.json
npm install
```
- if `npx ng serve` fails, ensure the Angular CLI is installed locally (if not installed globally):
```sh
npm install @angular/cli --save-dev
```