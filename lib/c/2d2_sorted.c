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

#include "../d2.h"

int main(int argc, char *argv[]){
	FILE *fp1;
	FILE *fp2;
	char line[MAX_LINE_SIZE];
	char file1[MAX_FILE_NAME_SIZE];
	char file2[MAX_FILE_NAME_SIZE];
	int ln,i;
	D2 d21,d22;
	char *token;
	int overlap;
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
	
//	d22 is super set
	overlap=0;
	not_end1=read_d2_fp(fp1,&d21);
	not_end2=read_d2_fp(fp2,&d22);
	while (not_end1 && not_end2){
		switch (strcmp(d21.name1,d22.name1)){
			case -1:
				not_end1=read_d2_fp(fp1,&d21);
				continue;
			case 1:
				not_end2=read_d2_fp(fp2,&d22);
				continue;
			case 0:
				switch (strcmp(d21.name2,d22.name2)){
					case -1:
						not_end1=read_d2_fp(fp1,&d21);
						continue;
					case 1:
						not_end2=read_d2_fp(fp2,&d22);
						continue;
					case 0:
						overlap++;
						printf("%s\t%s\n",d21.name1,d21.name2);

						not_end1=read_d2_fp(fp1,&d21);
						continue;
				}		
		}
	}
	fclose(fp1);
	fclose(fp2);
	ln=wc_l(file1);
	fprintf(stderr,"%f\n",(double)overlap/(double)ln);
	return 1;
}
