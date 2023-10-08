# Personal Blogging System 

**Final project - Starter Template - PGCert Information Technology**

This repository contains a starting point for your team's final project.

Your team should update this README to include the information required, as presented in the project handout available on Canvas.

## Database init

The server should automatically initialize the database if it needs to (commented code provided in [src/db/database.js](src/db/database.js)).
It has been left up to your team to design a way to check if SQL tables need to be created.

## Libraries & Technologies currently used

You are welcome to remove npm package and replace them with ones more suitable to your usecase.
The provided packages are a starting for packages you should consider researching and using.

Your team should remove any packages that is not being used in the project `npm remove <package-name>`

- HTTP Server:
  - express
  - morgan
  - express-handlebars
  - multer
  - cookie-parser (consider replacing with express-session)
  - uuid
- Image Processing:
  - Sharp (research how to use, or install & use `jimp` instead)
- Database:
  - sqlite
  - sqlite-template-strings (consider removing and use built in sanitization in sqlite)
- Development Tooling:
  - nodemon
  - prettier