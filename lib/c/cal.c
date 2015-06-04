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

#include "../ml.h"

int main(int argc, char *argv[]){
	FILE *fp;
	char line[100];
	char file[200];
	int ln,i;
	char *token;

	strcpy(file,argv[1]);

	if ((fp = fopen(file, "r")) == NULL){
		fprintf(stderr, "Coudn't open file %s\n",file);
		return -1;
	}
	ln=0;
	while (fgets(line, sizeof(line), fp) != NULL) {
		ln++;
		if ((token = strtok(line, "\t")) == NULL)
			break;
		i = atoi(token);
	}
	fclose(fp);

	return 1;
}
