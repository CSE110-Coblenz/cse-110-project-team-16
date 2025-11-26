// images.d.ts
//this file is used to support image imports in typescript
//Needed to import my images for the tutorial 


declare module "*.png" {
  const src: string;
  export default src;
}
