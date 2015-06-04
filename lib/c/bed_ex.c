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

#include "../format.h"


int main(int argc, char *argv[]){
	FILE *fp;
	char line[200];
	char file[30];
	int ln,i;
	char *token;
	BEDX *beds;

	strcpy(file,argv[1]);
	ln=read_bedx_file(file,&beds);
	sort_bed(&beds,ln);
	write_beds_file(file, &beds, ln);
	return 1;
}
