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
#include "../format_bedx.h"


int main(int argc, char *argv[]){
	FILE *fp;
	char line[200];
	char file[30];
	int ln,i;
	char *token;
	BEDX *beds;

	strcpy(file,argv[1]);
	ln=read_bedx_file(file,&beds);
	sort_bedx(&beds,ln);
	for (i=0;i<ln;i++)
		write_bedx(&beds[i]);
	return 1;
}
