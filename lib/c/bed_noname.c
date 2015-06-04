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
	char line[MAX_LINE_SIZE];
	char file[MAX_FILE_NAME_SIZE];
	int ln,i,namei;
	char *token;
	BED bed,pbed;


	strcpy(file,argv[1]);

	if ((fp = fopen(file, "r")) == NULL){
		fprintf(stderr, "Coudn't open file %s\n",file);
		return -1;
	}
	namei=0;
	if(fgets(line, sizeof(line), fp) != NULL){
		read_bed_line(line,&pbed);
		ln=1;
	}
	while (fgets(line, sizeof(line), fp) != NULL) {
		ln++;
		read_bed_line(line,&bed);

		if(strcmp(pbed.chr,bed.chr) 
				|| bed.stt>=pbed.end 
				|| pbed.strd != bed.strd){
			namei++;
			sprintf(pbed.name,"%d",namei);
			pbed.score=0;
			write_bed(&pbed);
			bedcpy(&pbed,&bed);
			continue;
		}
		
///	prepare for pbed			
		strcpy(pbed.chr,bed.chr);
//	pbed.stt=pbed.stt;
		if(pbed.end<bed.end)
			pbed.end = bed.end;
//		strcat(pbed.name,",");
//		strcat(pbed.name,bed.name);
//	pbed.strd=bed.strd;


	}
	fclose(fp);
	namei++;
	sprintf(pbed.name,"%d",namei);
	pbed.score=0;
	write_bed(&pbed);

	return 1;
}
