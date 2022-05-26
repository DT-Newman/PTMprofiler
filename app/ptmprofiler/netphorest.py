import pandas as pd
import re

# Load the netphotest database

def get_netphorest(netphorest_dataframe, stringid, threshold):
    df = netphorest_dataframe.loc[netphorest_dataframe['STRING'] == stringid]
    df = df.drop_duplicates()
    return df

def load_netphorest(loc):
    netphorest_df =  pd.read_csv(loc, compression='xz', sep='\t')
    netphorest_df.columns = ["Entry", "Position", "Residue", "Sequence", "Unknown", "Organism", "Type",  "Group", "Score"]
    netphorest_df["STRING"] = netphorest_df['Entry'].apply(lambda x: re.search(r'\((.*?)\)', x).group(1))
    return netphorest_df
