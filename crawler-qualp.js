const puppeteer = require('puppeteer');
var fs = require('fs');

async function scrape(origem, destino, categoria, eixos = 2) {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto("http://qualp.com.br/", { timeout: 0 });
    await page.waitFor(5000);
    
    if (categoria == "moto") {
        await page.click(".img-moto");
        await page.waitFor(1000);

    } else if (categoria == "caminhao") {
        await page.click(".img-truck");
        await page.waitFor(1000);

        // Clica no botão para aumentar a quantidade de Eixos
        eixos = eixos - 2; // Reduz da quantidade de eixos padrão
        for (let index = 0; index < eixos; index++) {
            await page.click("#btn-eixos-up");
        }

        await page.waitFor(1000);

    }

    await page.type("#origem", origem);
    await page.waitFor(1000);
    await page.type("#destino", destino);
    await page.waitFor(1000);
    await page.click("#btn-calcular");
    await page.waitFor(10000);

    const result = await page.evaluate(() => {

        let endereco_origem = document.querySelector('#tab-info-origem').innerText;
        let endereco_destino = document.querySelector('#tab-info-destinos').innerText;
        let distancia = document.querySelector('#tab-info-distancia').innerText;
        let tempo = document.querySelector('#tab-info-duracao').innerText;
        let pedagio = document.querySelector('#tab-info-total').innerText;

        let data = {};

        data["Endereço Origem"] = endereco_origem;
        data["Endereço Destino"] = endereco_destino;
        data["Distância"] = distancia;
        data["Tempo"] = tempo;
        data["Pedágio"] = pedagio;

        return data;
    });

    browser.close();

    return result;
};

let rotas = [
    // SEU ARRAY AQUI
    // Exemplo de item do array
    // ['-22.479052, -46.614997','-22.479052, -46.614997'],
];


async function processArray(rotas) {

    console.log('START EVERYTHING');
    console.time('ALL');
    var countTotal = 0;

    for (let rota of rotas) {
        let origem = rota[0];
        let destino = rota[1];
        let categoria = 'caminhao';
        let eixos = 4;

        console.log('START NODE');
        console.time('NODE');

        await scrape(origem, destino, categoria, eixos).then((value) => {
            value["Maps Origem"] = origem;
            value["Maps Destino"] = destino;

            console.log(value);
            fs.appendFile('rotas_caminhao.txt', JSON.stringify(value) + ',\n', function (error) {
                if (error)
                    throw error;
            });
        });

        countTotal++;
        console.log('Total: ', countTotal);
        console.log('END NODE');
        console.timeEnd('NODE');
    }

    console.log('END EVERYTHING');
    console.timeEnd('ALL');
}

processArray(rotas);