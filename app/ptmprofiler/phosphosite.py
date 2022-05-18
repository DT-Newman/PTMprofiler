
from urllib.request import urlopen, Request
from bs4 import BeautifulSoup
import json


def webscrape(uniprot: str) -> json:
    
    url = "http://www.phosphosite.org/uniprotAccAction?id=" + uniprot
    req = Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    html = urlopen(req).read()
    soup = BeautifulSoup(html, 'lxml') #  Create a beautiful soup object using lxml as the parser
    param = soup.find("param", {"id": "PTMsites"}) #Find the JSON data where all our phosphorylation data is kept
    data = json.loads(param['value']) #Load the JSON data as a json object
    #df = json_normalize(data) #Convert the JSON data to a dataframe
    return data



