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

	char file[300],ofile[300];
	char sys_str[1000];
	int ln,i,max_ln,chri;
	char *token;
//	BED beds_ori[10000];
	BED *beds;
//	beds=beds_ori;

	strcpy(file,argv[1]);
	strcpy(ofile,file);
	strcat(ofile,".tmp");
	char chr[24][10];

	strcpy(chr[0],"chr1");
	strcpy(chr[1],"chr10");
	strcpy(chr[2],"chr11");
	strcpy(chr[3],"chr12");
	strcpy(chr[4],"chr13");
	strcpy(chr[5],"chr14");
	strcpy(chr[6],"chr15");
	strcpy(chr[7],"chr16");
	strcpy(chr[8],"chr17");
	strcpy(chr[9],"chr18");
	strcpy(chr[10],"chr19");
	strcpy(chr[11],"chr2");
	strcpy(chr[12],"chr20");
	strcpy(chr[13],"chr21");
	strcpy(chr[14],"chr22");
	strcpy(chr[15],"chr3");
	strcpy(chr[16],"chr4");
	strcpy(chr[17],"chr5");
	strcpy(chr[18],"chr6");
	strcpy(chr[19],"chr7");
	strcpy(chr[20],"chr8");
	strcpy(chr[21],"chr9");
	strcpy(chr[22],"chrX");
	strcpy(chr[23],"chrY");
	
	if ((fp = fopen(ofile, "w")) == NULL){
		fprintf(stderr, "Coudn't open file %s\n",ofile);
		return -1;
	}
///*	
	max_ln=wc_l(file);
//10,000,000 validated
	if(max_ln>50000000){
//		fprintf(stderr,"sadfsafasdf\n");
		beds = (BED*)malloc(50000001 * sizeof(BED));
		if(beds == NULL){
			fprintf(stderr,"unsuccessful malloc %d\n",max_ln);
			return -1;
		}
	}
//			(BED*)malloc(100 * sizeof(BED));
	else{
//		fprintf(stderr,"Warning: may be out of limit\n%d\n%d\n",
//			max_ln, 50000000);
		beds = 
			(BED*)malloc(max_ln * sizeof(BED));
	}
//*/

	for (chri=0; chri<24; chri++){
		ln=read_bed_file_chr(file,&beds,chr[chri]);
		if (ln==0) continue;
		sort_bed(&beds,ln);
		write_beds_fp(fp, &beds, ln);
//	free(beds);
	}
	fclose(fp);

	strcpy(sys_str,"rm -f ");
	strcat(sys_str,file);
	system(sys_str);

	strcpy(sys_str,"mv ");
	strcat(sys_str,ofile);
	strcat(sys_str," ");
	strcat(sys_str,file);
	system(sys_str);
	return 1;
}
