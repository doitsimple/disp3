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

#include "/home/zyp/db/lib/C/io.h"
#include "/home/zyp/db/lib/C/st_ni2b.h"

int main(int argc, char *argv[]){
	FILE *fp;
	char line[MAX_LINE_SIZE];
	char netfile[MAX_FILE_NAME_LENGTH];
	char mapfile[MAX_FILE_NAME_LENGTH];
	int ln,i,j,maxnum,m,k;
	char *token;
	BIN_ARR *map;

	strcpy(netfile,argv[1]);
	strcpy(mapfile,argv[2]);
	maxnum=atoi(argv[3]);
	read_ni2b(mapfile,maxnum,&map);

	if ((fp = fopen(netfile, "r")) == NULL){
		fprintf(stderr, "Coudn't open file %s\n",netfile);
		return -1;
	}
	while (fgets(line, sizeof(line), fp) != NULL){

		if ((token = strtok(line, "\t")) == NULL)
			break; 
		i = atoi(token);
		if ((token = strtok(NULL, "\t\n")) == NULL)
			break; 
		j = atoi(token);
		
		if ((token = strtok(NULL, "\n")) == NULL)
			for(k=0;k<map[i].n;k++)
				printf("%d\t%d\n",map[i].v[k],j);
		else
			for(k=0;k<map[i].n;k++)
				printf("%d\t%d\t%s\n",map[i].v[k],j,token);
	}
	

	fclose(fp);
	return 1;
}
