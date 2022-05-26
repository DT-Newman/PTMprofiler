import pandas as pd
import re

# Load the netphotest database

def get_networkin(networkin_dataframe, stringid):
    df = networkin_dataframe.loc[networkin_dataframe['STRING'] == stringid]
    print(df.head())
    df = df.drop_duplicates()
    return df

def load_networkin(loc):
    networkin_df =  pd.read_csv(loc, compression='xz', sep='\t')
    networkin_df["STRING"] = networkin_df['#substrate'].apply(lambda x: re.search(r'\((.*?)\)', x).group(1))
    return networkin_df
