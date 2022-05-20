#PYTHON IMPORTS

#THIRD PARTY IMPORTS
import json
from urllib import response
from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.encoders import jsonable_encoder
from fastapi import Request



import numpy as np
import pandas as pd


#LOCAL IMPORTS




import ptmprofiler.uniprot as uniprot
from ptmprofiler.reSMALI import reSMALI
import ptmprofiler.phosphosite as phosphosite

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")



print("Starting PTM profiler")

# Load our uniprot identifier database
uniprot_human = pd.read_csv('./data/swiss-prot_human_2021_01.gz', compression='gzip', sep='\t')


#Homepage
@app.get('/', response_class=HTMLResponse)
@app.get('/home', response_class=HTMLResponse)
def index(request: Request):
    return templates.TemplateResponse('index.html', {"request": request} )

# #PTMprofile
# @app.get('/ptm_profile/', response_class=HTMLResponse)
# def ptm_profile(request: Request):
#     ##
#     return templates.TemplateResponse('ptm_profile.html', {"request":request})


#Select sites
@app.get('/profile/{entry}', response_class=HTMLResponse)
def select_phosphosites(request: Request, entry: str):
    entry_dict = {
         'entry' : entry,
         'gene_name' : uniprot.get_primary_gene_name_from_api(entry),
         'sequence' : uniprot.get_main_isoform_sequence(entry),
     }
    return templates.TemplateResponse('profile.html', {"request":request, "entry_dict":jsonable_encoder(entry_dict)})
    #"gene_name":uniprot.get_primary_gene_name_from_api(entry), "sequence": uniprot.get_main_isoform_sequence(entry)}


@app.get('/api/search_protein/{search}')
def protein_search(search):
     result = uniprot_human.loc[(uniprot_human['Gene names'].str.contains(search, regex=False, case=False)) | (uniprot_human['Entry'].str.contains(search, regex=False, case=False)) ]
     return jsonable_encoder(result.head(10).to_dict())


#Phosphosite
@app.get('/api/phosphosite/{uniprot}')
def phosphosite_webscrape(uniprot):
    result = phosphosite.webscrape(uniprot)
    return result


#RESMALI

@app.get('/api/resmali/condensed/{sequence}')
def resmali_condensed(sequence):
    result = reSMALI.condensedList(sequence)
    result_dict = dict()
    for item in result:
        result_dict[str(item[0])] = item[1]

    return jsonable_encoder(result_dict)

