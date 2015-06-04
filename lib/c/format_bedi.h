/*
# Template       : Last modified data 02/20/12
# Author         : SetupX
 */

#ifndef _format_bedi
#define _format_bedi

#include <stdio.h>
#include <stdlib.h> //itoa
#include <string.h> //strcpy ...
#include <errno.h>


typedef struct _BEDI{	
	char chr[15];
	int stt;
	int end;
	char name[200];
	int score;
	char strd;
	int ex;
} BEDI;

int read_bedi_line(char *line, BEDI *bed_ptr){
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

	if ((token = strtok(NULL, "\t")) == NULL)
		return 0;
	strcpy(bed_ptr->name,token);

	if ((token = strtok(NULL, "\t")) == NULL)
		return 0;
	if(!strcmp(token, ".") || !strcmp(token,"-"))
		bed_ptr->score=0;
	else
		bed_ptr->score=atoi(token);

	if ((token = strtok(NULL, "\t\n")) == NULL)
		return 0;
	bed_ptr->strd=token[0];

	if ((token = strtok(NULL, "\t\n")) == NULL)
		return 0;
	bed_ptr->ex=atoi(token);
}

int read_bedi_file_ln(char *file, BEDI **beds_ptr){
	FILE *fp;
	char line[MAX_LINE_SIZE];
	int ln,max_ln,i;

	max_ln=wc_l(file);
	if ((fp = fopen(file, "r")) == NULL){
		fprintf(stderr, "Coudn't open file %s\n",file);
		return -1;
	}
	*beds_ptr = 
		(BEDI*)malloc(max_ln * sizeof(BEDI));

	ln=0;
	while (fgets(line, sizeof(line), fp) != NULL) {
		read_bedi_line(line,&(*beds_ptr)[ln]);
		(*beds_ptr)[ln].ex=ln+1;
		ln++;
	}
	fclose(fp);
	return max_ln;
}
int read_bedi_file(char *file, BEDI **beds_ptr){
	FILE *fp;
	char line[MAX_LINE_SIZE];
	int ln,max_ln,i;

	max_ln=wc_l(file);
	if ((fp = fopen(file, "r")) == NULL){
		fprintf(stderr, "Coudn't open file %s\n",file);
		return -1;
	}
	*beds_ptr = 
		(BEDI*)malloc(max_ln * sizeof(BEDI));
	ln=0;
	while (fgets(line, sizeof(line), fp) != NULL) {
		read_bedi_line(line,&(*beds_ptr)[ln]);
		ln++;
	}
	fclose(fp);
	return max_ln;
}
int compare_bedi (const void *a, const void *b)
{
	switch( strcmp( ((BEDI *)a)->chr, ((BEDI *)b)->chr ) ){
		case 1: return 1;
		case -1: return -1;
		case 0:
			if( ((BEDI *)a)->stt > ((BEDI *)b)->stt )
				return 1;
			else if( ((BEDI *)a)->stt < ((BEDI *)b)->stt )
				return -1;
			else
				return ((BEDI *)a)->end > ((BEDI *)b)->end ? 1 : -1;
	}
}
int sort_bedi(BEDI **beds_ptr, int len){
	qsort((*beds_ptr), len, sizeof(BEDI), compare_bedi);
}

int write_bedi(BEDI *bed_ptr){
	printf("%s\t%d\t%d\t%s\t%d\t%c\t%d\n",
		bed_ptr->chr, bed_ptr->stt, bed_ptr->end,
		bed_ptr->name, bed_ptr->score, bed_ptr->strd, bed_ptr->ex);
	return 1;
}
int write_bedis_file(char *file, BEDI **beds_ptr, int ln){
	FILE *fp;
	int i;
	if ((fp = fopen(file, "w")) == NULL){
		fprintf(stderr, "Coudn't open file %s\n",file);
		return -1;
	}
	for (i=0; i<ln; i++){
		fprintf(fp,"%s\t%d\t%d\t%s\t%d\t%c\t%d\n",
				((*beds_ptr)[i]).chr, ((*beds_ptr)[i]).stt, ((*beds_ptr)[i]).end,
				((*beds_ptr)[i]).name, ((*beds_ptr)[i]).score, ((*beds_ptr)[i]).strd,
				((*beds_ptr)[i]).ex );
	}
	fclose(fp);
	return 1;
}
#endif
