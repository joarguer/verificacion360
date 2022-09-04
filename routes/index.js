let express = require('express');
let router = express.Router();

const puppeteer = require('puppeteer-extra');

const axios = require('axios').default;



router.post('/registraduria', async (req, res) => {
  
  let cedula = req.body.cc;
  let usuario = req.body.usuario;
  let password = req.body.password;
  
  const params = new URLSearchParams();
  params.append('usuario', usuario);
  params.append('password', password);
  
  axios({
      method: 'post',
      url: 'https://verificacion360.com/site/ajax/apiKey.php',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      data: params
    }).then(function (resp) {
      console.log('status',resp.data);
      if(resp.data == 1){
          console.log('Registraduria busca cedula: ',cedula);
          consultar_cedula(cedula);
      } else{
          console.log('Error: ','key errado!');
          let data = {'data': 'key errado!'};
          res.json(data);
      }
    })
    .catch(function (error) {
      console.log(error);
    });
  
  async function consultar_cedula(cedula){
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();

      console.log('preparando consulta...');
  
      const nombre = await consulta(page,'procuraduria',cedula);
  
      const data = {
          name: nombre
      };
      await browser.close();
      if(nombre !== false){
          console.log(data);
          res.json(data);
      } else{
          console.log(data);
          //res.json(data);
          consultar_cedula(cedula);
      }
      //
  };
});

async function consulta(page, website, cedula) {
    //REGISTRADURIA
    if (website === "procuraduria") {
      let documentNumber = cedula;

      console.log('buscando en registraduria....');
  
      await page.goto(
        "https://apps.procuraduria.gov.co/webcert/inicio.aspx?tpo=1"
      );
  
      await page.type("#txtNumID", documentNumber);
  
      await page.select("select#ddlTipoID", "1");
  
      await page.waitForSelector("#txtNumID");
  
      await page.waitForSelector("#lblPregunta");
  
      const question = await page.$eval(
        "#lblPregunta",
        (element) => element.textContent
      );

      await page.waitForTimeout(1000);
  
      let responseQuestion = "";
  
      if (question === "¿ Cuanto es 2 X 3 ?") {
        responseQuestion = "6";
      } else if (question === "¿ Cual es la Capital de Antioquia (sin tilde)?") {
        responseQuestion = "medellin";
      } else if (question === "¿ Cuanto es 3 - 2 ?") {
        responseQuestion = "1";
      } else if (question === "¿ Cuanto es 4 + 3 ?") {
        responseQuestion = "7";
      } else if (question === "¿ Cuanto es 5 + 3 ?") {
        responseQuestion = "8";
      } else if (question === "¿ Cual es la Capital del Atlantico?") {
        responseQuestion = "barranquilla";
      } else if (question === "¿ Cual es la Capital del Vallle del Cauca?") {
        responseQuestion = "cali";
      } else if ( question === "¿Escriba los tres primeros digitos del documento a consultar?") {
        responseQuestion = documentNumber.substring(0, 3);
      } else if (question === "¿ Cual es la Capital de Colombia (sin tilde)?") {
        responseQuestion = "bogota";
      } else if ( question === "¿Escriba los dos ultimos digitos del documento a consultar?" ) {
        responseQuestion = documentNumber.slice(-2);
      } else if (question === "¿ Cuanto es 3 X 3 ?") {
        responseQuestion = "9";
      } else if (question === "¿ Cuanto es 9 - 2 ?") {
        responseQuestion = "7";
      } else if (question === "¿ Cuanto es 6 + 2 ?") {
        responseQuestion = "8";
      } else {
        responseQuestion = "none";
      }
      if (responseQuestion !== "" && responseQuestion !== "none") {
        await page.type("#txtRespuestaPregunta", responseQuestion);
  
        await page.click("#btnConsultar");
  
        await page.waitForTimeout(1000);
  
        await page.waitForSelector("div#ValidationSummary1");
  
        //await page.evaluate('document.querySelector("div#ValidationSummary1").getAttribute("style")');
  
        const errorDiv = await page.$eval(
          "div#ValidationSummary1",
          (element) => element.textContent
        );
  
        //const error = await page.$eval('div#ValidationSummary1', element => element.getAttribute('style'));
        //console.log('Error: ' + errorDiv.trim());
        if (
          errorDiv.trim() ===
          "EL NÚMERO DE IDENTIFICACIÓN INGRESADO NO SE ENCUENTRA REGISTRADO EN EL SISTEMA."
        ) {
          await page.close();
          return "no existe";
        } else {
          await page.waitForSelector(".datosConsultado");
  
          const nombre_1 = await page.$eval(
            "#divSec > div > span:nth-child(1)",
            (element) => element.textContent
          );
  
          const nombre_2 = await page.$eval(
            "#divSec > div > span:nth-child(2)",
            (element) => element.textContent
          );
  
          const nombre_3 = await page.$eval(
            "#divSec > div > span:nth-child(3)",
            (element) => element.textContent
          );
  
          const nombre_4 = await page.$eval(
            "#divSec > div > span:nth-child(4)",
            (element) => element.textContent
          );
  
          const nombre_completo = nombre_1 + " " + nombre_2 + " " + nombre_3 + " " + nombre_4;
  
          await page.close();

          console.log("respuesta scraping: ok");
  
          return nombre_completo;
        }
      } else {
        console.log("respuesta scraping: error");
        await page.close();
        return false;
      }
    }
}

module.exports = router;
