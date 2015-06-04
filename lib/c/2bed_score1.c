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
	FILE *fp1;
	FILE *fp2;
	char line[MAX_LINE_SIZE];
	char file1[MAX_FILE_NAME_SIZE];
	char file2[MAX_FILE_NAME_SIZE];
	int ln,i;
	char *token;
	BED bed1,bed2;
	char cchr[15],pchr[15];
	int not_end1,not_end2;


	strcpy(file1,argv[1]);
	strcpy(file2,argv[2]);

	if ((fp1 = fopen(file1, "r")) == NULL){
		fprintf(stderr, "Coudn't open file %s\n",file1);
		return -1;
	}
	if ((fp2 = fopen(file2, "r")) == NULL){
		fprintf(stderr, "Coudn't open file %s\n",file2);
		return -1;
	}

	not_end1=read_bed_fp(fp1,&bed1);
	not_end2=read_bed_fp(fp2,&bed2);
	strcpy(cchr,bed1.chr);
	while (not_end1 && not_end2){
		if(strcmp(cchr,bed1.chr)){
			strcpy(cchr,bed1.chr);
			strcpy(pchr,bed2.chr);
			while (!strcmp(pchr,bed2.chr) && not_end2)
				not_end2 = read_bed_fp(fp2,&bed2);
			if(strcmp(bed2.chr,cchr) > 0){
				strcpy(cchr,bed2.chr);
				continue;
			}
		}
		if(strcmp(cchr,bed2.chr)){
			strcpy(cchr,bed2.chr);
			strcpy(pchr,bed1.chr);
			while (!strcmp(pchr,bed1.chr) && not_end1)
				not_end1 = read_bed_fp(fp1,&bed1);
			if(strcmp(bed1.chr,cchr) > 0){
				strcpy(cchr,bed1.chr);
				continue;
			}
		}

		if (bed2.stt < bed1.stt){
			if (bed2.end > bed1.stt)
				printf("%s\t%s\t%d\n",bed1.name,bed2.name,bed1.score);
			not_end2 = read_bed_fp(fp2,&bed2);
		}
		else{
			if (bed1.end > bed2.stt)
				printf("%s\t%s\t%d\n",bed1.name,bed2.name,bed1.score);
			not_end1 = read_bed_fp(fp1,&bed1);
		}
			
	}

	fclose(fp1);
	fclose(fp2);
	return 1;
}
