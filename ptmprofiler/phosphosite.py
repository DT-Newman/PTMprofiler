import numpy as np
import pandas as pd
from urllib.request import urlopen
from bs4 import BeautifulSoup
import sys
import re
import json
from collections import namedtuple
from pandas.io.json import json_normalize


def phosphosite_webscrape(uniprot_list: list) -> pd.DataFrame:
    for uniprot in uniprot_list: 

        url = "http://www.phosphosite.org/uniprotAccAction?id=" + uniprot
        html = urlopen(url) #Get the html file for the uniprot wesbite
        soup = BeautifulSoup(html, 'lxml') #  Create a beautiful soup object using lxml as the parser
        param = soup.find("param", {"id": "PTMsites"}) #Find the JSON data where all our phosphorylation data is kept
        data = json.loads(param['value']) #Load the JSON data as a json object
        df = json_normalize(data) #Convert the JSON data to a dataframe
        
        #This piece of code gets the sequence informaiton for each site
        newlist = []
        for index2, row2 in df.iterrows():
            newsoup = BeautifulSoup(row2['NMER'])
            newlist.append(newsoup.get_text())
        df['NMER'] = newlist
        df['uniprot'] = uniprot
        output_dataframe = output_dataframe.append(df, ignore_index=True)

        return output_dataframe


