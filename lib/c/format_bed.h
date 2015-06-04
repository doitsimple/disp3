/*
# Template       : Last modified data 02/20/12
# Author         : SetupX
 */

#ifndef _format_bed
#define _format_bed

#include <stdio.h>
#include <stdlib.h> //itoa
#include <string.h> //strcpy ...
#include <errno.h>

#define MAX_LINE_SIZE 1000
#define MAX_FILE_NAME_SIZE 100
extern char *program_invocation_short_name;
typedef struct _BED{
	char chr[15];
	int stt;
	int end;
	char name[MAX_LINE_SIZE];
	int score;
	char strd;
} BED;

/*
int bedinit(BED *bed_ptr){
	strcpy(bed_ptr->chr,"");
	bed_ptr->stt=0;
	bed_ptr->end=INT_MAX;
	strcpy(bed_ptr->name,"");
	bed_ptr->score=0;
	bed_ptr->strd='.';
	return 1;
}
*/
int bedcpy(BED *t_bed_ptr, BED *bed_ptr){
	strcpy (t_bed_ptr->chr,bed_ptr->chr);
	t_bed_ptr->stt = bed_ptr->stt;
	t_bed_ptr->end = bed_ptr->end;
	strcpy (t_bed_ptr->name,bed_ptr->name);
	t_bed_ptr->score = bed_ptr->score;
	t_bed_ptr->strd = bed_ptr->strd;
	return 1;
}

int read_bed_line(char *line, BED *bed_ptr){
	char *token;
	if ((token = strtok(line, "\t")) == NULL)
		return 0;
	//printf("%s\n",token);
	strcpy(bed_ptr->chr,token);

	if ((token = strtok(NULL, "\t")) == NULL)
		return 0;
		bed_ptr->stt=atoi(token);

	if ((token = strtok(NULL, "\t\n")) == NULL)
		return 0;
		bed_ptr->end=atoi(token);

	if ((token = strtok(NULL, "\t\n")) == NULL)
		return 0;
	strcpy(bed_ptr->name,token);

	if ((token = strtok(NULL, "\t\n")) == NULL)
		return 0;
	if(!strcmp(token, ".") || !strcmp(token,"-"))
		bed_ptr->score=0;
	else
		bed_ptr->score=atoi(token);

	if ((token = strtok(NULL, "\t\n")) == NULL)
		return 0;
	bed_ptr->strd=token[0];

	return 1;
}
int read_bed_fp(FILE *fp, BED *bed_ptr){
	char line[MAX_LINE_SIZE];
	if(fgets(line, sizeof(line), fp) != NULL) {
		read_bed_line(line,bed_ptr);
		return 1;
	}
	else{
		return 0;
	}
}
int wc_l(char *file){
	FILE *fp;
	char line[MAX_LINE_SIZE];
	int ln;

	if ((fp = fopen(file, "r")) == NULL){
		fprintf(stderr, "Coudn't open file %s\n",file);
		return -1;
	}
	ln=0;
	while (fgets(line, sizeof(line), fp) != NULL) {
		ln++;
	}
	fclose(fp);
	return ln;
}

int read_bed_file(char *file, BED **beds_ptr){
	FILE *fp;
	char line[MAX_LINE_SIZE];
	int ln,max_ln,i;

	max_ln=wc_l(file);
	if ((fp = fopen(file, "r")) == NULL){
		fprintf(stderr, "Coudn't open file %s\n",file);
		return -1;
	}
//	printf("ln%d\n",max_ln);
//	printf("ln%d\t%d\t%d\t%d\n",max_ln * sizeof(BED),sizeof(BED),INT_MAX/sizeof(BED),INT_MAX);
	*beds_ptr = 
		(BED*)malloc(max_ln * sizeof(BED));
//	*beds_ptr = 		(BED*)malloc(INT_MAX);

	ln=0;
	while (fgets(line, sizeof(line), fp) != NULL) {
//		printf("%d\n",ln);
		read_bed_line(line,&(*beds_ptr)[ln]);
		ln++;
	}
	fclose(fp);
	return max_ln;
}
int read_bed_file_chr(char *file, BED **beds_ptr,char *chr){
	FILE *fp;
	char line[MAX_LINE_SIZE];
	int ln,i;
	char *token;
	BED *bed_ptr;

	if ((fp = fopen(file, "r")) == NULL){
		fprintf(stderr, "Coudn't open file %s\n",file);
		return -1;
	}

	ln=0;
	while (fgets(line, sizeof(line), fp) != NULL) {
		if ((token = strtok(line, "\t")) == NULL) 
			return 0;
//		fprintf(stderr,"%d\n",ln);
		if(strcmp(chr,token)) 
			continue;
//		printf("%d\n",ln);
		bed_ptr=&(*beds_ptr)[ln];
//		printf("%d\t%s\t%s\n",ln,token,bed_ptr->chr);
		strcpy(bed_ptr->chr,token);

		if ((token = strtok(NULL, "\t")) == NULL)
			return 0;
		bed_ptr->stt=atoi(token);

//		printf("%d\n",ln);

		if ((token = strtok(NULL, "\t")) == NULL)
			return 0;
		bed_ptr->end=atoi(token);

		if ((token = strtok(NULL, "\t\n")) == NULL)
			return 0;
		strcpy(bed_ptr->name,token);

		if ((token = strtok(NULL, "\t\n")) == NULL)
			return 0;
		if(!strcmp(token, ".") || !strcmp(token,"-"))
			bed_ptr->score=0;
		else
			bed_ptr->score=atoi(token);

		if ((token = strtok(NULL, "\t\n")) == NULL)
			return 0;
		bed_ptr->strd=token[0];

		ln++;
		if(ln >5e7)
			fprintf(stderr,"Exceed max memory\n");
	}
	fclose(fp);
	fprintf(stderr,"%s: %d\n",chr,ln);
	return ln;
}

int compare_bed (const void *a, const void *b)
{
	if(strcmp( ((BED *)a)->chr, ((BED *)b)->chr) > 0){
		return 1;	
	}else if(strcmp( ((BED *)a)->chr, ((BED *)b)->chr) < 0){
		return -1;
	}else{
		if( ((BED *)a)->stt > ((BED *)b)->stt )
			return 1;
		else if( ((BED *)a)->stt < ((BED *)b)->stt )
			return -1;
		else
			return ((BED *)a)->end > ((BED *)b)->end ? 1 : -1;
	}
}
int sort_bed(BED **beds_ptr, int len){
	qsort((*beds_ptr), len, sizeof(BED), compare_bed);
}

int compare_bed_strd (const void *a, const void *b)
{
	if(((BED *)a)->strd == ((BED *)b)->strd)
		switch( strcmp( ((BED *)a)->chr, ((BED *)b)->chr ) ){
		case 1: return 1;
		case -1: return -1;
		case 0:
						 if( ((BED *)a)->stt > ((BED *)b)->stt )
							 return 1;
						 else if( ((BED *)a)->stt < ((BED *)b)->stt )
							 return -1;
						 else
							 return ((BED *)a)->end > ((BED *)b)->end ? 1 : -1;
		}
	else if( ((BED *)a)->strd != '-' )
		return -1;
	else
		return 1;

}
int sort_bed_strd(BED **beds_ptr, int len){
	qsort((*beds_ptr), len, sizeof(BED), compare_bed_strd);
}

int compare_bed_name (const void *a, const void *b)
{
	switch( strcmp(((BED *)a)->name, ((BED *)b)->name) ){
		case 1: return 1;
		case -1: return -1;
		case 0:
			switch( strcmp( ((BED *)a)->chr, ((BED *)b)->chr ) ){
				case 1: return 1;
				case -1: return -1;
				case 0:
						 if( ((BED *)a)->stt > ((BED *)b)->stt )
							 return 1;
						 else if( ((BED *)a)->stt < ((BED *)b)->stt )
							 return -1;
						 else
							 return ((BED *)a)->end > ((BED *)b)->end ? 1 : -1;
			}
	}
}
int sort_bed_name(BED **beds_ptr, int len){
	qsort((*beds_ptr), len, sizeof(BED), compare_bed_name);
}

int write_bed(BED *bed_ptr){
	printf("%s\t%d\t%d\t%s\t%d\t%c\n",
			bed_ptr->chr, bed_ptr->stt, bed_ptr->end,
			bed_ptr->name, bed_ptr->score, bed_ptr->strd);
	return 1;
}

int write_beds_file(char *file, BED **beds_ptr, int ln){
	FILE *fp;
	int i;
	if ((fp = fopen(file, "w")) == NULL){
		fprintf(stderr, "Coudn't open file %s\n",file);
		return -1;
	}
	for (i=0; i<ln; i++){
		fprintf(fp,"%s\t%d\t%d\t%s\t%d\t%c\n",
				((*beds_ptr)[i]).chr, ((*beds_ptr)[i]).stt, ((*beds_ptr)[i]).end,
				((*beds_ptr)[i]).name, ((*beds_ptr)[i]).score, ((*beds_ptr)[i]).strd);
	}
	fclose(fp);
	return 1;
}
int write_beds_fp(FILE *fp, BED **beds_ptr, int ln){
	int i;
	for (i=0; i<ln; i++){
		fprintf(fp,"%s\t%d\t%d\t%s\t%d\t%c\n",
				((*beds_ptr)[i]).chr, ((*beds_ptr)[i]).stt, ((*beds_ptr)[i]).end,
				((*beds_ptr)[i]).name, ((*beds_ptr)[i]).score, ((*beds_ptr)[i]).strd);
	}
	return 1;
}

#endif
