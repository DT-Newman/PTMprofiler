import numpy as np
import pandas as pd
from urllib.request import urlopen
from bs4 import BeautifulSoup
import sys
import re
import itertools

def get_pfam_info(uniprot_id: str) -> pd.DataFrame:
    """
    Returns a dataframe cotaining the information contained in the domain map at pfam.xfam.org

    """
    color_cycler = itertools.cycle(['#e50000', '#0343df', '#89fe05', '#bf77f6', '#ffff14', '#ff028d'])
    url = "http://pfam.xfam.org/protein/" + uniprot_id
    print('Going to url: ' + url)
    html = urlopen(url)
    soup = BeautifulSoup(html, 'lxml')
    table = soup.find("table", {"id": "imageKey"})
    table2 = table.find("tbody")
    tablerows = table2.find_all('tr')
    uniprot = []
    source = []
    domain = []
    start = []
    end = []
    gathering_threshold = []
    score = []
    e_value = []
    color = []
    for currentrow in tablerows:
        cells = currentrow.find_all('td', attrs={})
        uniprot.append(uniprot_id)
        source.append(cells[0].get_text())
        domain.append(cells[1].get_text())
        start.append(cells[2].get_text())
        end.append(cells[3].get_text())
        gathering_threshold.append(cells[4].get_text())
        score.append(cells[5].get_text())
        e_value.append(cells[6].get_text())
        if cells[0].get_text() == 'Pfam':
            color.append(next(color_cycler))
        else:
            color.append('#000000')
    data = {'uniprot_id': uniprot, 'source': source, 'domain': domain, 'start': start, 'end': end, 'gathering threshold (bits)': gathering_threshold, 'score (bits)': score, 'e-value': e_value, 'color': color}
    return pd.DataFrame(data)


def get_pfam_from_list(uniprot_list: list) -> pd.DataFrame:
    """
    Returns a dataframe containing pfam information from pfam.xfam.org from a list of uniprot ids

    """
    pfamdata  = pd.DataFrame()
    for uniprotid in uniprot_list:
        pfamdata = pfamdata.append(get_pfam_info(uniprotid), ignore_index=True)

    return pfamdata