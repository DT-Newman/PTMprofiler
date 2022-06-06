import numpy as np
import pandas as pd
import re


def trypsin(sequence):
    cut_list = []
    exception = ['CKD', 'DKD', 'CKH', 'CKY', 'CRK', 'RRH', 'RRR']
    for i in range(len(sequence) - 1):
        if (sequence[i] == "K") | (sequence[i] == "R"):
            if sequence[i+1] != "P":
                if sequence[i-1:i+2] not in exception:
                    cut_list.append(i + 1)
            elif (sequence[i] == "K") & (sequence[i-1] == "W") :
                cut_list.append(i + 1)
            elif (sequence[i] == "R") & (sequence[i-1] == "M") :
                cut_list.append(i + 1)
    return cut_list



digest_dispatch = {
    'trypsin': trypsin,

}

def get_peptide_list(sequence: str, enzyme: str) -> list:
    """
    Returns list containing the start and end values
    """
    return digest_dispatch[enzyme](sequence)

