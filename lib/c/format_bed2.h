/*
# Template       : Last modified data 02/20/12
# Author         : SetupX
 */

#ifndef _format_bed2
#define _format_bed2

#include <stdio.h>
#include <stdlib.h> //itoa
#include <string.h> //strcpy ...
#include <errno.h>
#include "format_bed.h"

#define MAX_LINE_SIZE 1000
#define MAX_FILE_NAME_SIZE 100


extern char *program_invocation_short_name;
typedef struct _BED2{	
	char chr[15];
	int stt;
	int end;
	char chr2[15];
	int stt2;
	int end2;
} BED2;

int bed2cpy(BED2 *t_bed_ptr, BED2 *bed_ptr){
	strcpy (t_bed_ptr->chr,bed_ptr->chr);
	t_bed_ptr->stt = bed_ptr->stt;
	t_bed_ptr->end = bed_ptr->end;
	strcpy (t_bed_ptr->chr2,bed_ptr->chr2);
	t_bed_ptr->stt2 = bed_ptr->stt2;
	t_bed_ptr->end2 = bed_ptr->end2;
	return 1;
}
char compare_bed2_self(BED2 *bedptr){
	switch( strcmp( bedptr->chr, bedptr->chr2 ) ){
	case 1: return 1;
	case -1: return 0;
	case 0:
		if( bedptr->stt < bedptr->stt2 )
			return 0;
		else if( bedptr->stt > bedptr->stt2 )
			return 1;
		else if( bedptr->end <= bedptr->end2 )
			return 0;
		else
			return 1;
	}
}
void switch_bed2(BED2 *bed_ptr){
	static BED tmp_bed;
	strcpy(tmp_bed.chr, bed_ptr->chr);
	tmp_bed.stt=bed_ptr->stt;
	tmp_bed.end=bed_ptr->end;

	strcpy(bed_ptr->chr,bed_ptr->chr2);
	bed_ptr->stt=bed_ptr->stt2;
	bed_ptr->end=bed_ptr->end2;

	strcpy(bed_ptr->chr2,tmp_bed.chr);
	bed_ptr->stt2=tmp_bed.stt;
	bed_ptr->end2=tmp_bed.end;
}

int read_bed2_line_simple(char *line, BED2 *bed_ptr){
	char *token;
	if ((token = strtok(line, "\t")) == NULL)
		return 0;
	strcpy(bed_ptr->chr,token);


	if ((token = strtok(NULL, "\t")) == NULL)
		return 0;
	bed_ptr->stt=atoi(token);

	if ((token = strtok(NULL, "\t")) == NULL)
		return 0;
	bed_ptr->end=atoi(token);

	if ((token = strtok(NULL, "\t\n")) == NULL)
		return 0;
	strcpy(bed_ptr->chr2,token);

	if ((token = strtok(NULL, "\t\n")) == NULL)
		return 0;
	bed_ptr->stt2=atoi(token);

	if ((token = strtok(NULL, "\t\n")) == NULL)
		return 0;
	bed_ptr->end2=atoi(token);

	return 1;
}
int read_bed2_line(char *line, BED2 *bed_ptr){
	char *token;
	if ((token = strtok(line, "\t")) == NULL)
		return 0;
	strcpy(bed_ptr->chr,token);


	if ((token = strtok(NULL, "\t")) == NULL)
		return 0;
	bed_ptr->stt=atoi(token);

	if ((token = strtok(NULL, "\t")) == NULL)
		return 0;
	bed_ptr->end=atoi(token);

	if ((token = strtok(NULL, "\t\n")) == NULL)
		return 0;
	strcpy(bed_ptr->chr2,token);

	if ((token = strtok(NULL, "\t\n")) == NULL)
		return 0;
	bed_ptr->stt2=atoi(token);

	if ((token = strtok(NULL, "\t\n")) == NULL)
		return 0;
	bed_ptr->end2=atoi(token);

	if(compare_bed2_self(bed_ptr)){
		switch_bed2(bed_ptr);
	}
	return 1;
}
int read_bed2_line_both(char *line, BED2 *bed_ptr, BED2 *bed_ptr2){
	char *token;
	if ((token = strtok(line, "\t")) == NULL)
		return 0;
	strcpy(bed_ptr->chr,token);
	strcpy(bed_ptr2->chr2,token);


	if ((token = strtok(NULL, "\t")) == NULL)
		return 0;
	bed_ptr->stt=atoi(token);
	bed_ptr2->stt2=atoi(token);

	if ((token = strtok(NULL, "\t")) == NULL)
		return 0;
	bed_ptr->end=atoi(token);
	bed_ptr2->end2=atoi(token);

	if ((token = strtok(NULL, "\t\n")) == NULL)
		return 0;
	strcpy(bed_ptr->chr2,token);
	strcpy(bed_ptr2->chr,token);

	if ((token = strtok(NULL, "\t\n")) == NULL)
		return 0;
	bed_ptr->stt2=atoi(token);
	bed_ptr2->stt=atoi(token);

	if ((token = strtok(NULL, "\t\n")) == NULL)
		return 0;
	bed_ptr->end2=atoi(token);
	bed_ptr2->end=atoi(token);

	return 1;
}
int read_bed2_fp(FILE *fp, BED2 *bed_ptr){
	char line[MAX_LINE_SIZE];
	if(fgets(line, sizeof(line), fp) != NULL) {
		read_bed2_line_simple(line,bed_ptr);
		return 1;
	}
	else{
		return 0;
	}
}

int compare_bed2 (const void *a, const void *b)
{
	switch( strcmp( ((BED2 *)a)->chr, ((BED2 *)b)->chr ) ){
	case 1: return 1;
	case -1: return -1;
	case 0:
		if( ((BED2 *)a)->stt > ((BED2 *)b)->stt )
			return 1;
		else if( ((BED2 *)a)->stt < ((BED2 *)b)->stt )
			return -1;
		else if( ((BED2 *)a)->end > ((BED2 *)b)->end )
			return 1;
		else if( ((BED2 *)a)->end < ((BED2 *)b)->end )
			return -1;
		else 
			switch( strcmp( ((BED2 *)a)->chr2, ((BED2 *)b)->chr2 ) ){
				case 1: return 1;
				case -1: return -1;
				case 0:
								 if( ((BED2 *)a)->stt2 > ((BED2 *)b)->stt2 )
									 return 1;
								 else if( ((BED2 *)a)->stt2 < ((BED2 *)b)->stt2 )
									 return -1;
								 else if( ((BED2 *)a)->end2 > ((BED2 *)b)->end2 )
									 return 1;
								 else
									 return -1;
			}
	}
}
int _compare_bed2 (BED2 *a, BED2 *b)
{
	switch( strcmp( a->chr, b->chr ) ){
	case 1: return 1;
	case -1: return -1;
	case 0:
		if( a->stt > b->stt )
			return 1;
		else if( a->stt < b->stt )
			return -1;
		else if( a->end > b->end )
			return 1;
		else if( a->end < b->end )
			return -1;
		else 
			switch( strcmp( a->chr2, b->chr2 ) ){
				case 1: return 1;
				case -1: return -1;
				case 0:
								 if( a->stt2 > b->stt2 )
									 return 1;
								 else if( a->stt2 < b->stt2 )
									 return -1;
								 else if( a->end2 > b->end2 )
									 return 1;
								 else if( a->end2 < b->end2 )
									 return -1;
								 else
									return 0;
			}
	}
}
int read_bed2_file(char *file, BED2 **beds_ptr){
	FILE *fp;
	char line[MAX_LINE_SIZE];
	int ln,max_ln,i;

	max_ln=wc_l(file);
	if ((fp = fopen(file, "r")) == NULL){
		fprintf(stderr, "Coudn't open file %s\n",file);
		return -1;
	}
	*beds_ptr = 
		(BED2*)malloc(max_ln * sizeof(BED2));

	ln=0;
	while (fgets(line, sizeof(line), fp) != NULL) {
		read_bed2_line(line,&(*beds_ptr)[ln]);
		ln++;
	}
	fclose(fp);
	return max_ln;
}
int read_bed2_file_both(char *file, BED2 **beds_ptr){
	FILE *fp;
	char line[MAX_LINE_SIZE];
	int ln,max_ln,i;

	max_ln=wc_l(file);
	if ((fp = fopen(file, "r")) == NULL){
		fprintf(stderr, "Coudn't open file %s\n",file);
		return -1;
	}
	*beds_ptr = 
		(BED2*)malloc((max_ln*2) * sizeof(BED2));

	ln=0;
	while (fgets(line, sizeof(line), fp) != NULL) {
		read_bed2_line_both(line,&(*beds_ptr)[ln],&(*beds_ptr)[ln+1]);
		ln+=2;
	}
	fclose(fp);
	return max_ln*2;
}
int read_bed2_file_chr(char *file, BED2 **beds_ptr,char *chr){
	FILE *fp;
	char line[MAX_LINE_SIZE];
	int ln,i;
	char *token;
	BED2 *bed_ptr;

	if ((fp = fopen(file, "r")) == NULL){
		fprintf(stderr, "Coudn't open file %s\n",file);
		return -1;
	}

	ln=0;
	while (fgets(line, sizeof(line), fp) != NULL) {
		if ((token = strtok(line, "\t")) == NULL) return 0;
		if(strcmp(chr,token)) continue;
		bed_ptr=&(*beds_ptr)[ln];
		strcpy(bed_ptr->chr,token);

		if ((token = strtok(NULL, "\t")) == NULL)
			return 0;
		bed_ptr->stt=atoi(token);

		if ((token = strtok(NULL, "\t")) == NULL)
			return 0;
		bed_ptr->end=atoi(token);

		if ((token = strtok(NULL, "\t\n")) == NULL)
			return 0;
		strcpy(bed_ptr->chr2,token);

		if ((token = strtok(NULL, "\t\n")) == NULL)
			return 0;
		bed_ptr->stt2=atoi(token);

		if ((token = strtok(NULL, "\t\n")) == NULL)
			return 0;
		bed_ptr->end2=atoi(token);

		ln++;
	}
	fclose(fp);
	fprintf(stderr,"%s: %d\n",chr,ln);
	return ln;
}

int sort_bed2(BED2 **beds_ptr, int len){
	qsort((*beds_ptr), len, sizeof(BED2), compare_bed2);
}

int write_bed2(BED2 *bed_ptr){
	printf("%s\t%d\t%d\t%s\t%d\t%d\n",
			bed_ptr->chr, bed_ptr->stt, bed_ptr->end,
			bed_ptr->chr2, bed_ptr->stt2, bed_ptr->end2);
	return 1;
}

int write_beds2_file(char *file, BED2 **beds_ptr, int ln){
	FILE *fp;
	int i;
	if ((fp = fopen(file, "w")) == NULL){
		fprintf(stderr, "Coudn't open file %s\n",file);
		return -1;
	}
	for (i=0; i<ln; i++){
		fprintf(fp,"%s\t%d\t%d\t%s\t%d\t%d\n",
				((*beds_ptr)[i]).chr, ((*beds_ptr)[i]).stt, ((*beds_ptr)[i]).end,
				((*beds_ptr)[i]).chr2, ((*beds_ptr)[i]).stt2, ((*beds_ptr)[i]).end2);
	}
	fclose(fp);
	return 1;
}
int write_beds2_file_unique(char *file, BED2 **beds_ptr, int ln){
	FILE *fp;
	int i;
	BED2 tmp_bed;
	BED2 *bed1, *bed2;
	bed1=&tmp_bed;

	if ((fp = fopen(file, "w")) == NULL){
		fprintf(stderr, "Coudn't open file %s\n",file);
		return -1;
	}
	strcpy(tmp_bed.chr,"chr0");
	for (i=0; i<ln; i++){
		bed2=&((*beds_ptr)[i]);

		if(_compare_bed2(bed1, bed2)){
			fprintf(fp,"%s\t%d\t%d\t%s\t%d\t%d\n",
				bed2->chr, bed2->stt, bed2->end,
				bed2->chr2, bed2->stt2, bed2->end2);
		}
		bed2cpy(bed1, bed2);
	}
	fclose(fp);
	return 1;
}
int write_beds2_fp_unique(FILE *fp, BED2 **beds_ptr, int ln){
	int i;
	BED2 *bed1, *bed2;

	bed1=&((*beds_ptr)[0]);
	fprintf(fp,"%s\t%d\t%d\t%s\t%d\t%d\n",
			bed1->chr, bed1->stt, bed1->end,
			bed1->chr2, bed1->stt2, bed1->end2);
	for (i=1; i<ln; i++){
		bed2=&((*beds_ptr)[i]);

		if(_compare_bed2(bed1, bed2)){
			fprintf(fp,"%s\t%d\t%d\t%s\t%d\t%d\n",
				bed2->chr, bed2->stt, bed2->end,
				bed2->chr2, bed2->stt2, bed2->end2);
		}
		bed2cpy(bed1, bed2);
	}
	return 1;
}
int write_beds2_fp(FILE *fp, BED2 **beds_ptr, int ln){
	int i;
	for (i=0; i<ln; i++){
		fprintf(fp,"%s\t%d\t%d\t%s\t%d\t%c\n",
				((*beds_ptr)[i]).chr, ((*beds_ptr)[i]).stt, ((*beds_ptr)[i]).end,
				((*beds_ptr)[i]).chr2, ((*beds_ptr)[i]).stt2, ((*beds_ptr)[i]).end2);
	}
	return 1;
}

#endif
