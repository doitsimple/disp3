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


int main(int argc, char *argv[]){
	FILE *fp;

	char file[MAX_FILE_NAME_SIZE];
	char tfile[MAX_FILE_NAME_SIZE];
	int ln,i,begin_i;
	FILE *fp1;
	char *token;
	BED *beds,tbed;
	int hit;

	strcpy(tfile,argv[1]);
	strcpy(file,argv[2]);
	ln=read_bed_file(file,&beds);
	
	if ((fp1 = fopen(tfile, "r")) == NULL){
		fprintf(stderr, "Coudn't open file %s\n",tfile);
		return -1;
	}
	begin_i=0;
	i=0;
	hit=0;
	while (read_bed_fp(fp1,&tbed)){
		if (begin_i>=ln){
			hit=0;
		}
		else{

			while (strcmp(tbed.chr,beds[begin_i].chr) == 1)
				begin_i++;
				
			if (strcmp(tbed.chr,beds[begin_i].chr) == -1){
				hit=0;
			}
			else{
				i=begin_i;
				hit=0;
				while (1)
				{
//			printf("1--%s\t%d\t%d\t\n",beds[i].chr,beds[i].stt,beds[i].end);
//			printf("2--%s\t%d\t%d\t\n",tbed.chr,tbed.stt,tbed.end);
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
					if(tbed.strd != beds[i].strd)
						hit++;
//			printf("%s\t%s\n",tbed.name,beds[i].name);
					i++;
					continue;
				}
			}
		}
		if (hit==0)
			write_bed(&tbed);
	}
	fclose(fp1);
	return 1;
}
