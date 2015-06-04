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
	char file[30];
	int ln,i;
	char *token;
	BED bed,pbed;


	strcpy(file,argv[1]);

	if ((fp = fopen(file, "r")) == NULL){
		fprintf(stderr, "Coudn't open file %s\n",file);
		return -1;
	}
	if(fgets(line, sizeof(line), fp) != NULL){
		read_bed_line(line,&pbed);
		ln=1;
	}
	while (fgets(line, sizeof(line), fp) != NULL) {
		ln++;
		read_bed_line(line,&bed);

		if(strcmp(bed.chr,pbed.chr) 
				|| bed.stt!=pbed.stt
				|| bed.end!=pbed.end
				|| strcmp(bed.name,pbed.name)
//				|| bed.score!=pbed.score
				|| bed.strd != pbed.strd){
			write_bed(&pbed);
			bedcpy(&pbed,&bed);
			continue;
		}

	}
	fclose(fp);
	write_bed(&pbed);

	return 1;
}
