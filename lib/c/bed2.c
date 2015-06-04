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

#include "../format_bed2.h"


int main(int argc, char *argv[]){
	FILE *fp;

	char file[100];
	int ln,i;
	char *token;
	BED2 *beds;

	strcpy(file,argv[1]);
	ln=read_bed2_file(file,&beds);
	sort_bed2(&beds,ln);
	write_beds2_file(file, &beds, ln);
	return 1;
}
