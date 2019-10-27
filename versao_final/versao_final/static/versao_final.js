$(function(){
    var inpFebre = $('#inpFebre');
    var selTosse = $('#selTosse');
    var selFaltaAr = $('#selFaltaAr');
    var selDor = $('#selDor');
    var selMalEstar = $('#selMalEstar');
    var selFraqueza = $('#selFraqueza');
    var selSuor = $('#selSuor');
    var selNauseaVomito = $('#selNauseaVomito');
    var btnConsultar = $('#btnConsultar');
    var divAprioriResultados = $('#divAprioriResultados');
    var divFPGrowthResultados = $('#divFPGrowthResultados');

    document.getElementById('inpFebre').value = 37.5;

    btnConsultar.on('click', function(){
        var febre = '';
        $(".loading-screen").show();

        if(parseFloat(inpFebre.val()) > 37.5){
            febre = '37,5 +';
        }else if (parseFloat(inpFebre.val()) < 37.5){
            febre = '37,5 -';
        }else{
            febre = 'Normal';
        }

        $.ajax({
            url     : 'regra_apriori',
            type    : 'POST',
            data    : {
                febre: febre,
                tosse: selTosse.val(),
                faltaAr: selFaltaAr.val(),
                dor: selDor.val(),
                malEstar: selMalEstar.val(),
                fraqueza: selFraqueza.val(),
                suor: selSuor.val(),
                nausea: selNauseaVomito.val()
            },
            dataType: 'json',
            success : function(data){
                console.log("Apriori");
                console.log(data);
                geraHtmlResultados(data, divAprioriResultados);

                $.ajax({
                    url     : 'regra_fp_growth',
                    type    : 'POST',
                    data    : {
                        febre: febre,
                        tosse: selTosse.val(),
                        faltaAr: selFaltaAr.val(),
                        dor: selDor.val(),
                        malEstar: selMalEstar.val(),
                        fraqueza: selFraqueza.val(),
                        suor: selSuor.val(),
                        nausea: selNauseaVomito.val()
                    },
                    dataType: 'json',
                    success : function(data){
                        console.log("FP-Growth");
                        console.log(data);
                        geraHtmlResultados(data, divFPGrowthResultados);
                        $(".loading-screen").hide();
                    }
                });
            }
        });
    })
})

function geraHtmlResultados(data, divResultados){
    data = JSON.parse(data);

    //Estrutura do html dos resultados Apriori e FP-Growth
    var accordionRegrasHtml = " <div id='accordion'> \
                                    <div class='card'> \
                                        <div class='card-header' id='headingAprioriOne' data-toggle='collapse' data-target='#collapseAprioriOne' aria-expanded='true' aria-controls='collapseAprioriOne'> \
                                            <h5 class='mb-0'> \
                                                <button class='btn btn-link' > \
                                                Informações gerais \
                                                </button> \
                                            </h5> \
                                        </div> \
                                        <div id='collapseAprioriOne' class='collapse' aria-labelledby='headingAprioriOne' data-parent='#accordion'> \
                                            <div class='card-body first'> \
                                                {0} \
                                            </div> \
                                        </div> \
                                    </div> \
                                    <div class='card'> \
                                        <div class='card-header' id='headingAprioriTwo'  data-toggle='collapse' data-target='#collapseAprioriTwo' aria-expanded='false' aria-controls='collapseAprioriTwo'> \
                                            <h5 class='mb-0'> \
                                                <button class='btn btn-link collapsed'> \
                                                <p>Regras analisadas pneumonia positiva <span class='badge badge-positive'>{1}</span></p> \
                                                </button> \
                                            </h5> \
                                        </div> \
                                        <div id='collapseAprioriTwo' class='collapse' aria-labelledby='headingAprioriTwo' data-parent='#accordion'> \
                                            <div class='card-body'> \
                                                {2} \
                                            </div> \
                                        </div> \
                                    </div> \
                                    <div class='card'> \
                                        <div class='card-header' id='headingAprioriThree' data-toggle='collapse' data-target='#collapseAprioriThree' aria-expanded='false' aria-controls='collapseAprioriThree'> \
                                            <h5 class='mb-0'> \
                                                <button class='btn btn-link collapsed' > \
                                                Regras analisadas pneumonia negativa <span class='badge badge-negative'>{3}</span> \
                                                </button> \
                                            </h5> \
                                        </div> \
                                        <div id='collapseAprioriThree' class='collapse' aria-labelledby='headingAprioriThree' data-parent='#accordion'> \
                                            <div class='card-body'> \
                                                {4} \
                                            </div> \
                                        </div> \
                                    </div> \
                                </div>";

    var informacoesHtml = ' <p><strong>Nº de regras geradas: </strong>{0}</p>  \
                            <p><strong>Nº de regras analisadas: </strong>{1}</p> \
                            <p><strong>Nº regras Pneumonia positiva: </strong>{2}</p> \
                            <p><strong>Nº regras Pneumonia negativa: </strong>{3}</p> \
                            <p><strong>Chance de Pneumonia positiva: </strong>{4}</p> \
                            <p><strong>Chance de Pneumonia negativa: </strong>{5}</p>';

    var regrasPneumoniaPositivaHtml = "<tablevid='tablePneumoniaPositiva' class='table table-bordered table-dark'> \
                                        <thead> \
                                            <tr> \
                                                <th scope='col'>Suporte</th> \
                                                <th scope='col'>Febre</th> \
                                                <th scope='col'>Tosse</th> \
                                                <th scope='col'>Falta ár</th> \
                                                <th scope='col'>Dor</th> \
                                                <th scope='col'>Mal estar</th> \
                                                <th scope='col'>Fraqueza</th> \
                                                <th scope='col'>Suor</th> \
                                                <th scope='col'>Nausea</th> \
                                                <th scope='col'>Pneumonia</th> \
                                            </tr> \
                                        </thead> \
                                        <tbody> \
                                            {0} \
                                        </tbody> \
                                    </table>";
    var regrasPneumoniaNegativaHtml = "<table id='tablePneumoniaNegativa' class='table table-bordered table-dark'> \
                                        <thead> \
                                            <tr> \
                                                <th scope='col'>Suporte</th> \
                                                <th scope='col'>Febre</th> \
                                                <th scope='col'>Tosse</th> \
                                                <th scope='col'>Falta ár</th> \
                                                <th scope='col'>Dor</th> \
                                                <th scope='col'>Mal estar</th> \
                                                <th scope='col'>Fraqueza</th> \
                                                <th scope='col'>Suor</th> \
                                                <th scope='col'>Nausea</th> \
                                                <th scope='col'>Pneumonia</th> \
                                            </tr> \
                                        </thead> \
                                        <tbody> \
                                            {0} \
                                        </tbody> \
                                    </table>";
    var tableRowHtml = "<tr> \
                            <td>{0}%</td> \
                            <td>{1}</td> \
                            <td>{2}</td> \
                            <td>{3}</td> \
                            <td>{4}</td> \
                            <td>{5}</td> \
                            <td>{6}</td> \
                            <td>{7}</td> \
                            <td>{8}</td> \
                            <td>{9}</td> \
                        </tr>";
    var tableRowsPneumonia = "";
    var tableRowsNaoPneumonia= "";
    
    //Começo montagem html das informações gerais do accordion

    var chancePneumonia = Math.round((parseInt(data.regrasPneumonia.length) / parseInt(data.qtRegrasAnalisadas)) * 100);
    var chanceNaoPneumonia = 100 - chancePneumonia;
    


    informacoesHtml = informacoesHtml.replace('{0}', data.qtRegrasGeradas)
                                        .replace('{1}', data.qtRegrasAnalisadas)
                                        .replace('{2}', data.regrasPneumonia.length)
                                        .replace('{3}', data.regrasNaoPneumonia.length)
                                        .replace('{4}', chancePneumonia + '%')
                                        .replace('{5}', chanceNaoPneumonia + '%');

    //Fim montagem html das informações gerais do accordion



    //Começo montagem html das regras analisadas pneumonia positiva

    for(var numRegra = 0; numRegra < parseInt(data.regrasPneumonia.length); numRegra ++){
        tableRowsPneumonia += tableRowHtml.replace('{0}', data.regrasPneumonia[numRegra].suporte)
                                            .replace('{1}', data.regrasPneumonia[numRegra].febre == "" ? "-" : data.regrasPneumonia[numRegra].febre)
                                            .replace('{2}', data.regrasPneumonia[numRegra].tosse == "" ? "-" : data.regrasPneumonia[numRegra].tosse)
                                            .replace('{3}', data.regrasPneumonia[numRegra].faltaAr == "" ? "-" : data.regrasPneumonia[numRegra].faltaAr)
                                            .replace('{4}', data.regrasPneumonia[numRegra].dor == "" ? "-" : data.regrasPneumonia[numRegra].dor)
                                            .replace('{5}', data.regrasPneumonia[numRegra].malEstar == "" ? "-" : data.regrasPneumonia[numRegra].malEstar)
                                            .replace('{6}', data.regrasPneumonia[numRegra].fraqueza == "" ? "-" : data.regrasPneumonia[numRegra].fraqueza)
                                            .replace('{7}', data.regrasPneumonia[numRegra].suor == "" ? "-" : data.regrasPneumonia[numRegra].suor)
                                            .replace('{8}', data.regrasPneumonia[numRegra].nausea == "" ? "-" : data.regrasPneumonia[numRegra].nausea)
                                            .replace('{9}', data.regrasPneumonia[numRegra].pneumonia == "" ? "-" : data.regrasPneumonia[numRegra].pneumonia);
                                                
    }

    regrasPneumoniaPositivaHtml = regrasPneumoniaPositivaHtml.replace('{0}', tableRowsPneumonia);

    //Fim montagem html das regras analisadas pneumonia positiva



    //Começo montagem html das regras analisadas pneumonia negativa

    for(var numRegra = 0; numRegra < parseInt(data.regrasNaoPneumonia.length); numRegra ++){
        tableRowsNaoPneumonia += tableRowHtml.replace('{0}', data.regrasNaoPneumonia[numRegra].suporte)
                                            .replace('{1}', data.regrasNaoPneumonia[numRegra].febre == "" ? "-" : data.regrasNaoPneumonia[numRegra].febre)
                                            .replace('{2}', data.regrasNaoPneumonia[numRegra].tosse == "" ? "-" : data.regrasNaoPneumonia[numRegra].tosse)
                                            .replace('{3}', data.regrasNaoPneumonia[numRegra].faltaAr == "" ? "-" : data.regrasNaoPneumonia[numRegra].faltaAr)
                                            .replace('{4}', data.regrasNaoPneumonia[numRegra].dor == "" ? "-" : data.regrasNaoPneumonia[numRegra].dor)
                                            .replace('{5}', data.regrasNaoPneumonia[numRegra].malEstar == "" ? "-" : data.regrasNaoPneumonia[numRegra].malEstar)
                                            .replace('{6}', data.regrasNaoPneumonia[numRegra].fraqueza == "" ? "-" : data.regrasNaoPneumonia[numRegra].fraqueza)
                                            .replace('{7}', data.regrasNaoPneumonia[numRegra].suor == "" ? "-" : data.regrasNaoPneumonia[numRegra].suor)
                                            .replace('{8}', data.regrasNaoPneumonia[numRegra].nausea == "" ? "-" : data.regrasNaoPneumonia[numRegra].nausea)
                                            .replace('{9}', data.regrasNaoPneumonia[numRegra].pneumonia == "" ? "-" : data.regrasNaoPneumonia[numRegra].pneumonia);
    }

    regrasPneumoniaNegativaHtml = regrasPneumoniaNegativaHtml.replace('{0}', tableRowsNaoPneumonia);

    //Fim montagem html das regras analisadas pneumonia negativa



    //Começo montagem html completo

    accordionRegrasHtml = accordionRegrasHtml.replace('{0}', informacoesHtml)
                                                .replace('{1}', data.regrasPneumonia.length)
                                                .replace('{2}', regrasPneumoniaPositivaHtml)
                                                .replace('{3}', data.regrasNaoPneumonia.length)
                                                .replace('{4}', regrasPneumoniaNegativaHtml)

    divResultados.html(accordionRegrasHtml);
    //Fim montagem html completo
}