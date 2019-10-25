from pyramid.view import view_config
from efficient_apriori import apriori
import pyfpgrowth
import pandas as pd
import xlrd
import csv
import json

class Sintomas:
    def __init__(self, febre, tosse, faltaAr, dor, malEstar, fraqueza, suor, nausea):
        self.febre = febre
        self.tosse = tosse
        self.faltaAr = faltaAr
        self.dor = dor
        self.malEstar = malEstar
        self.fraqueza = fraqueza
        self.suor = suor
        self.nausea = nausea

class Regra:
    def __init__(self, suporte, febre, tosse, faltaAr, dor, malEstar, fraqueza, suor, nausea, pneumonia):
        self.suporte = suporte # Percentual de suporte da regra
        self.febre = febre # Armazena os valores "37,5 +" ou "37,5 -"
        self.tosse = tosse # Armazena os valores "Sem tosse", "Tosse seca", "Tosse catarro amarelado" ou "Tosse catarro esverdeado"
        self.faltaAr = faltaAr # Armazena os valores "Falta ar" ou "Respiracao normal"
        self.dor = dor # Armazena os valores "Sem dor", "Peito", "Torax" ou "Torax e Peito"
        self.malEstar = malEstar # Armazena os valores "Mal estar" ou "Sem mal estar"
        self.fraqueza = fraqueza # Armazena os valores "Sim" ou "Nao"
        self.suor = suor # Armazena os valores "Intenso" ou Normal
        self.nausea = nausea # Armazena os valores "Nausea" ou "Sem Nausea"
        self.pneumonia = pneumonia # Armazena os valores 0 ou 1 de acordo com a regra analisada

class Resultado:
    def __init__(self, regrasPneumonia, regrasNaoPneumonia):
        self.regrasPneumonia = []
        for regraPneumonia in regrasPneumonia: #Armazena as regras analisadas que tem pneumonia
            self.regrasPneumonia.append(regraPneumonia)
        
        self.regrasNaoPneumonia = []
        for regraNaoPneumonia in regrasNaoPneumonia: #Armazena as regras analisadas que não tem pneumonia
            self.regrasNaoPneumonia.append(regraNaoPneumonia)

    def toJson(self): #Organiza para converter em JSON
        regrasPneumoniaJson = []
        regrasNaoPneumoniaJson = []

        for regraPneumonia in self.regrasPneumonia:
            regrasPneumoniaJson.append({
                "suporte": regraPneumonia.suporte,
                "febre": regraPneumonia.febre,
                "tosse": regraPneumonia.tosse,
                "faltaAr": regraPneumonia.faltaAr,
                "dor": regraPneumonia.dor,
                "malEstar": regraPneumonia.malEstar,
                "fraqueza": regraPneumonia.fraqueza,
                "suor": regraPneumonia.suor,
                "nausea": regraPneumonia.nausea,
                "pneumonia": regraPneumonia.pneumonia
            })

        for regraNaoPneumonia in self.regrasNaoPneumonia:
            regrasNaoPneumoniaJson.append({
                "suporte": regraNaoPneumonia.suporte,
                "febre": regraNaoPneumonia.febre,
                "tosse": regraNaoPneumonia.tosse,
                "faltaAr": regraNaoPneumonia.faltaAr,
                "dor": regraNaoPneumonia.dor,
                "malEstar": regraNaoPneumonia.malEstar,
                "fraqueza": regraNaoPneumonia.fraqueza,
                "suor": regraNaoPneumonia.suor,
                "nausea": regraNaoPneumonia.nausea,
                "pneumonia": regraNaoPneumonia.pneumonia
            })

        return {
            "regrasPneumonia": regrasPneumoniaJson,
            "regrasNaoPneumonia": regrasNaoPneumoniaJson
        }

#Converte a base de dados de .xls para .csv
def converteToCsv():
    with xlrd.open_workbook('Base de dados.xls') as wb:
        sh = wb.sheet_by_index(0)
        with open('Base de dados.csv', 'w', newline="") as f:
            c = csv.writer(f)
            for r in range(sh.nrows):
                c.writerow(sh.row_values(r))




@view_config(route_name='home', renderer='templates/mytemplate.jinja2')
def my_view(request):
    return {'project': 'versao_final'}




#Função chamada pelo documento versao_final.js via chamada ajax para realizar a função de Apriori
@view_config(route_name='gera_regras_apriori', renderer='json')                     
def gera_regras_apriori(request):

    converteToCsv()
    jsonRegrasApriori = geraJsonComAsRegrasAnalisadas("Apriori", request)

    return jsonRegrasApriori




#Função chamada pelo documento versao_final.js via chamada ajax para realizar a função do FP-Growth
@view_config(route_name='gera_regras_fp_growth', renderer='json')                     
def gera_regras_fp_growth(request):

    jsonRegrasFpGrowth = geraJsonComAsRegrasAnalisadas("FP-Growth", request)

    return jsonRegrasFpGrowth

#Função responsável por gerar as regras da duas bibliotecas (efficient-apriori e pyfpgrowth)
def geraJsonComAsRegrasAnalisadas(biblioteca, request):
    bancoDados = pd.read_csv("Base de dados.csv")
    listaLinhasBancoDados = []
    sintomas = Sintomas(request.POST['febre'], request.POST['tosse'], request.POST['faltaAr'], request.POST['dor'], request.POST['malEstar'], request.POST['fraqueza'], request.POST['suor'], request.POST['nausea']) #Pega os dados que vieram do request no ajax e mapeia no objeto Sintomas
    suporte = 0.1 #Controla o suporte para o while
    regrasMapeada = [] #Lista para armazenar as regras mapeadas no objeto Regra
    regrasPneumonia = [] #Lista para armazenar as regras que possuem os sintomas iguais ao sintomas de entrada do paciente e que tem pneumonia positiva
    regrasNaoPneumonia = [] #Lista para armazenar as regras que possuem os sintomas iguais ao sintomas de entrada do paciente e que tem pneumonia negativa

    for index, linha in bancoDados.iterrows(): #Pega todas as linhas do excel e adiciona em uma lista
        listaLinhasBancoDados.append((linha["Nome"],
                                    linha["Febre"],
                                    linha["Tosse"],
                                    linha["Falta ar e dificuldade respirar"],
                                    linha["Dor"],
                                    linha["Mal-estar generalizado"],
                                    linha["Fraqueza"],
                                    linha["Suor intenso"],
                                    linha["Nausea e Vomito"],
                                    str(int(linha["Pneumonia"]))))

    while suporte < 1.1: #Gera as regras para o suporte de 0.1 até 1

        suporte = round(suporte, 1)

        if biblioteca == "Apriori":
            regras = apriori(listaLinhasBancoDados, min_support= suporte,  min_confidence=1) #Usa a API do apriori para gerar as regras com confiança de 100% e suporte de 10% até 100%

            for regraMapeada in mapeiaRegrasBiblioteca(regras[1], suporte): #Mapeia as regras em objetos Regra
                regrasMapeada.append(regraMapeada)
        else:
            padroes = pyfpgrowth.find_frequent_patterns(listaLinhasBancoDados, 250)
            regras = pyfpgrowth.generate_association_rules(padroes, suporte) #Usa a API do FP growth para gerar as regras com confiança de 100%

            for regraMapeada in mapeiaRegrasBiblioteca(regras, suporte): #Mapeia as regras em objetos Regra
                regrasMapeada.append(regraMapeada)

        suporte += 0.1

        if (suporte > 1.0):
            break
                
    for regraMapeada in regrasMapeada:

        numeroSintomasEntradaUsuario = 0 #Contador para controlar se a regra possui todos sintomas iguais aos sintomas de entrada do paciente

        #Verifica quais informações dos sintomas de entrada do usuário são compativeis com os sintomas da regras
        if sintomas.febre in regraMapeada.febre:
            numeroSintomasEntradaUsuario += 1
        if sintomas.tosse in regraMapeada.tosse:
            numeroSintomasEntradaUsuario += 1
        if sintomas.faltaAr in regraMapeada.faltaAr:
            numeroSintomasEntradaUsuario += 1
        if sintomas.dor in regraMapeada.dor:
            numeroSintomasEntradaUsuario += 1
        if sintomas.malEstar in regraMapeada.malEstar:
            numeroSintomasEntradaUsuario += 1
        if sintomas.fraqueza in regraMapeada.fraqueza:
            numeroSintomasEntradaUsuario += 1
        if sintomas.suor in regraMapeada.suor:
            numeroSintomasEntradaUsuario += 1
        if sintomas.nausea in regraMapeada.nausea:
            numeroSintomasEntradaUsuario += 1

        #Verifica se seis dos sintomas das regras são compativeis com os sintomas de entrada do usuário
        if numeroSintomasEntradaUsuario >= 3:
            if regraMapeada.pneumonia == "0": #Divide as regras que possuem como resultado Sim para Pneumonia em um lista e as regras que possuem como resultado Não para Pneumonia em outra lista
                regrasNaoPneumonia.append(regraMapeada)
            else:
                regrasPneumonia.append(regraMapeada)

    resultado = Resultado(regrasPneumonia, regrasNaoPneumonia)    
    resultadoJSON = json.dumps(resultado.toJson())

    return resultadoJSON   




def mapeiaRegrasBiblioteca(regras, suporte):
    regrasMapeada = [] #Lista para armazenar as regras mapeadas no objeto Regra

    #Variáveis para organizar os objetos
    febre = ""
    tosse = ""
    faltaAr = ""
    dor = ""
    malEstar = ""
    fraqueza = ""
    suor = ""
    nausea = ""
    pneumonia = ""

    for regra in regras: #For para buscar todas as regras que contém a informação 0 ou 1 referente a contração ou não de pneumonia

        strRegra = str(regra).split("(")[0] #Pega a parte importante da regra para analisar

        if strRegra == '': #Caso seja regras do FP-Growth, pois os formatos das regras são diferentes
            strRegra = regra

        if ("0" in str(strRegra) or "1" in str(strRegra)):
            
            #Mapeia Febre
            if ("37,5 +" in str(strRegra)):
                febre = "37,5 +"
            elif ("37,5 -" in str(strRegra)):
                febre = "37,5 -"

            #Mapeia Tosse
            if ("Sem tosse" in str(strRegra)):
                tosse = "Sem tosse"
            elif ("Tosse seca" in str(strRegra)):
                tosse = "Tosse seca"
            elif ("Tosse catarro amarelado" in str(strRegra)):
                tosse = "Tosse catarro amarelado"
            elif ("Tosse catarro esverdeado" in str(strRegra)):
                tosse = "Tosse catarro esverdeado"

            #Mapeia Falta Ar
            if ("Falta ar" in str(strRegra)):
                faltaAr = "Falta Ar"
            elif ("Respiracao normal" in str(strRegra)):
                faltaAr = "Respiracao normal"

            #Mapeia Dor
            if ("Sem dor" in str(strRegra)):
                dor = "Sem dor"
            elif ("Peito" in str(strRegra)):
                dor = "Peito"
            elif ("Torax" in str(strRegra)):
                dor = "Torax"
            elif ("Torax e Peito" in str(strRegra)):
                dor = "Torax a Peito"

            #Mapeia Mal Estar
            if ("Mal estar" in str(strRegra)):
                malEstar = "Mal estar"
            elif ("Sem mal estar" in str(strRegra)):
                malEstar = "Sem mal estar"

            #Mapeia Fraqueza
            if ("Sim" in str(strRegra)):
                fraqueza = "Sim"
            elif ("Nao" in str(strRegra)):
                fraqueza = "Nao"

            #Mapeia suor
            if ("Normal" in str(strRegra)):
                suor = "Normal"
            elif ("Intenso" in str(strRegra)):
                suor = "Intenso"    

            #Mapeia Nausea
            if ("Nausea" in str(strRegra)):
                nausea = "Nausea"
            elif ("Sem nausea" in str(strRegra)):
                nausea = "Sem nausea"

            #Mapeia Pneumonia
            if ("0" in str(strRegra)):
                pneumonia = "0"
            elif ("1" in str(strRegra)):
                pneumonia = "1"

            regraMapeada = Regra(suporte * 100, febre, tosse, faltaAr, dor, malEstar, fraqueza, suor, nausea, pneumonia) #Monta o objeto regra para melhor controle das informações
            regrasMapeada.append(regraMapeada)
    
    return regrasMapeada