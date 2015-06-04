/*
# Descriptions   : 
# Usage          : 
# Parameters	 : none
# Sample Input   : 
# Sample Output  : 
# Depedency      : none
# Temp File      : none
# Comments       : none
# See Also       : none
# Data           : 
# Template       : Last modified date 11/16/10
# Author         : setupX
*/

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>
#include <limits.h>

#include "../format_bed.h"
#include "../format_bedi.h"


int main(int argc, char *argv[]){
	FILE *fp;

	char file[MAX_FILE_NAME_SIZE];
	char tfile[MAX_FILE_NAME_SIZE];
	int ln,i,begin_i;
	FILE *fp1;
	char *token;
	BED tbed;
	BEDI *beds;
	double cord;

	strcpy(tfile,argv[1]);
	strcpy(file,argv[2]);
	ln=read_bedi_file(file,&beds);
	
	if ((fp1 = fopen(tfile, "r")) == NULL){
		fprintf(stderr, "Coudn't open file %s\n",tfile);
		return -1;
	}
	begin_i=0;
	i=0;
	while (read_bed_fp(fp1,&tbed)){
		if (begin_i>=ln)
			break;
		while (begin_i<ln-1 && strcmp(tbed.chr,beds[begin_i].chr) > 0)
			begin_i++;
		if (strcmp(tbed.chr,beds[begin_i].chr) < 0)
			continue;
		i=begin_i;
		while (1)
		{
			if(strcmp(tbed.chr,beds[i].chr))
				break;
			if(tbed.end <= beds[i].stt)
				break;
			if(tbed.stt >= beds[i].end){
				if(begin_i == i)
					begin_i++;
				i++;
				continue;
			}
			if(beds[i].strd != '-')
				cord = (double)(tbed.stt+tbed.end)/2.0 - (double)beds[i].ex;
			else
				cord = (double)beds[i].ex - (double)(tbed.stt+tbed.end)/2.0;
			printf("%s\t%s\t%.1f\n",tbed.name,beds[i].name,cord);
			i++;
			continue;
		}
	}
	fclose(fp1);
	return 1;
}
