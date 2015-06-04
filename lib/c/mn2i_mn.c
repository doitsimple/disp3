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

#include "../net_mn.h"


int main(int argc, char *argv[]){
	FILE *fp;

	char file[MAX_FILE_NAME_SIZE];
	int ln,i;
	char *token;
	MN2I *mn2is;

	strcpy(file,argv[1]);
	ln=read_mn2i_file(file,&mn2is);
	sort_mn2i(&mn2is,ln);
	write_mn2is_file(file, &mn2is, ln);
	return 1;
}
