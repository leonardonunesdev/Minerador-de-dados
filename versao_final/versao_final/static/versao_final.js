$(function(){
    var inpFebre = $("#inpFebre");
    var selTosse = $("#selTosse");
    var selFaltaAr = $("#selFaltaAr");
    var selDor = $("#selDor");
    var selMalEstar = $("#selMalEstar");
    var selFraqueza = $("#selFraqueza");
    var selSuor = $("#selSuor");
    var selNauseaVomito = $("#selNauseaVomito");
    var btnConsultar = $("#btnConsultar");
    var divAprioriResultados = $("#divAprioriResultados");
    var divFPGrowthResultados = $("#divFPGrowthResultados");

    document.getElementById("inpFebre").value = 37.5;

    btnConsultar.on("click", function(){
        var resultadoHTML = "<p>Suporte: {0}%</p><p>Regra: {1}</p>";
        var febre = "";

        if(parseFloat(inpFebre.val()) > 37.5){
            febre = "37,5 +";
        }else if (parseFloat(inpFebre.val()) < 37.5){
            febre = "37,5 -";
        }else{
            febre = "37,5";
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
                alert("Foi");
            },
            error: function(){
                alert("Erro");
            }
        });

        /* $.ajax({
            url     : 'regra_fp_growth',
            type    : 'POST',
            data    : {
                febre: inpFebre.val(),
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
                var json = JSON.parse(data);
                resultadoHTML = resultadoHTML.replace("{0}", json.valorSuporte).replace("{1}", json.descricao);
                divFPGrowthResultados.html(resultadoHTML);
            },
            error: function(){
                alert("Erro");
            }
        }); */
    })

})