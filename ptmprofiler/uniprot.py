import xml.etree.ElementTree as ET
from xml.etree.ElementTree import fromstring
from urllib.request import urlopen

import pandas as pd
import numpy as np


def get_main_isoform_sequence(uniprot_id: str) -> str:
  """ Returns the fasta seuqence for a given uniprot id directly from the uniprot api """
  url = "https://www.uniprot.org/uniprot/" + uniprot_id + ".fasta"
  fasta_file = urlopen(url).read()
  if fasta_file == b'':
    return -1
  fasta = fasta_file.decode("utf-8")
  fasta = fasta.split("\n", 1)[1]
  fasta = fasta.replace("\n", "")
  return fasta

def get_gene_names_from_db(uniprot_id: str, database: pd.DataFrame) -> list:
  """ Returns a list of gene names from a pandas dataframe containing  """
  result = database.loc[uniprot_human['Entry'] == uniprot_id]
  if len(result) == 0:
    raise ValueError("Uniprot entry is not contained within the provided uniprot dataframe")
  if len(result) > 2:
    raise ValueError("Multiple uniprot entries were returned from the uniprot dataframe")
  
  return result.iloc[0]['Entry'].split(" ")


def get_uniprot_entry_xml_tree(uniprot_id: str) -> ET.ElementTree:
  """ Returns the element tree for a given uniprot entry """
  url = urlopen("https://www.uniprot.org/uniprot/" + uniprot_id + ".xml").read()
  return ET.ElementTree(fromstring(url))
  return ET.fromstring(url)

def get_uniprot_gene_name__from_xml_tree(tree: ET.ElementTree) -> str:
  """ Returns the primary gene name listed in the element tree """
  #find gene tag
  gene_tag = tree.getroot()[0].find('{http://uniprot.org/uniprot}gene')
  if type(gene_tag) is not None:

    for gene_name in gene_tag :
      if gene_name.attrib['type'] == 'primary':
        return gene_name.text

  return "undefined"


def get_primary_gene_name_from_api(uniprot_id: str) -> str:
  """ Returns the primary gene name for a given uniprot entry """
  tree = get_uniprot_entry_xml_tree(uniprot_id)
  return get_uniprot_gene_name__from_xml_tree(tree)


