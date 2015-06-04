/*
# Template       : Last modified data 02/20/12
# Author         : SetupX
 */

#ifndef _format_bedx
#define _format_bedx

#include <stdio.h>
#include <stdlib.h> //itoa
#include <string.h> //strcpy ...
#include <errno.h>

#define EX_LEN 1000
#define NAME_LEN 1000

typedef struct _BEDX{	
	char chr[15];
	int stt;
	int end;
	char name[NAME_LEN];
	int score;
	char strd;
	char ex[EX_LEN];
} BEDX;

int read_bedx_line(char *line, BEDX *bed_ptr){
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

	if ((token = strtok(NULL, "\n")) == NULL)
		return 0;
	strncpy(bed_ptr->ex,token,EX_LEN);

}
int read_bedx_file(char *file, BEDX **beds_ptr){
	FILE *fp;
	char line[MAX_LINE_SIZE];
	int ln,max_ln,i;

	max_ln=wc_l(file);
	if ((fp = fopen(file, "r")) == NULL){
		fprintf(stderr, "Coudn't open file %s\n",file);
		return -1;
	}
	*beds_ptr = 
		(BEDX*)malloc(max_ln * sizeof(BEDX));

	ln=0;
	while (fgets(line, sizeof(line), fp) != NULL) {
		read_bedx_line(line,&(*beds_ptr)[ln]);
		ln++;
	}
	fclose(fp);
	return max_ln;
}

int compare_bedx (const void *a, const void *b)
{
	switch( strcmp( ((BEDX *)a)->chr, ((BEDX *)b)->chr ) ){
		case 1: return 1;
		case -1: return -1;
		case 0:
			if( ((BEDX *)a)->stt > ((BEDX *)b)->stt )
				return 1;
			else if( ((BEDX *)a)->stt < ((BEDX *)b)->stt )
				return -1;
			else
				if( ((BEDX *)a)->end > ((BEDX *)b)->end )
					return 1;
				else if ( ((BEDX *)a)->end < ((BEDX *)b)->end )
					return -1;
				else
					if( ((BEDX *)a)->strd != ((BEDX *)b)->strd )
						if( ((BEDX *)a)->strd != '-' )
							return 1;
						else
							return -1;
					else
						if( strcmp( ((BEDX *)a)->ex, ((BEDX *)b)->ex ) >0 )
							return 1;
						else
							return -1;
	}
}
int sort_bedx(BEDX **beds_ptr, int len){
	qsort((*beds_ptr), len, sizeof(BEDX), compare_bedx);
}

int write_bedx(BEDX *bed_ptr){
	printf("%s\t%d\t%d\t%s\t%d\t%c\t%s\n",
		bed_ptr->chr, bed_ptr->stt, bed_ptr->end,
		bed_ptr->name, bed_ptr->score, bed_ptr->strd, bed_ptr->ex);
	return 1;
}
int write_bedxs_file(char *file, BEDX **beds_ptr, int ln){
	FILE *fp;
	int i;
	if ((fp = fopen(file, "w")) == NULL){
		fprintf(stderr, "Coudn't open file %s\n",file);
		return -1;
	}
	for (i=0; i<ln; i++){
		fprintf(fp,"%s\t%d\t%d\t%s\t%d\t%c\t%s\n",
			((*beds_ptr)[i]).chr, ((*beds_ptr)[i]).stt, ((*beds_ptr)[i]).end,
			((*beds_ptr)[i]).name, ((*beds_ptr)[i]).score, ((*beds_ptr)[i]).strd,
			((*beds_ptr)[i]).ex
			);
	}
	fclose(fp);
	return 1;
}
#endif
