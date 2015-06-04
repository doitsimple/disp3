/*
# Template       : Last modified data 02/20/12
# Author         : SetupX
 */

#ifndef _d2
#define _d2

#include <stdio.h>
#include <stdlib.h> //itoa
#include <string.h> //strcpy ...
#include <errno.h>

#define MAX_LINE_SIZE 1000
#define MAX_FILE_NAME_SIZE 100
#define MAX_NAME_LENGTH 30

extern char *program_invocation_short_name;
typedef struct _D2{	
	char name1[MAX_LINE_SIZE];
	char name2[MAX_LINE_SIZE];
} D2;
int d2cpy(D2 *t_d2_ptr, D2 *d2_ptr){
	strcpy (t_d2_ptr->name1,d2_ptr->name1);
	strcpy (t_d2_ptr->name2,d2_ptr->name2);
	return 1;
}
int read_d2_line(char *line, D2 *d2_ptr){
	char *token;
	if ((token = strtok(line, "\t")) == NULL)
		return 0;
	strcpy(d2_ptr->name1,token);

	if ((token = strtok(NULL, "\t\n")) == NULL)
		return 0;
	strcpy(d2_ptr->name2,token);
	return 1;
}
int read_d2_fp(FILE *fp, D2 *d2_ptr){
	char line[MAX_LINE_SIZE];
	if(fgets(line, sizeof(line), fp) != NULL) {
		read_d2_line(line,d2_ptr);
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

int read_d2_file(char *file, D2 **d2s_ptr){
	FILE *fp;
	char line[MAX_LINE_SIZE];
	int ln,max_ln,i;

	max_ln=wc_l(file);
	if ((fp = fopen(file, "r")) == NULL){
		fprintf(stderr, "Coudn't open file %s\n",file);
		return -1;
	}
	*d2s_ptr = 
		(D2*)malloc(max_ln * sizeof(D2));

	ln=0;
	while (fgets(line, sizeof(line), fp) != NULL) {
		read_d2_line(line,&(*d2s_ptr)[ln]);
		ln++;
	}
	fclose(fp);
	return max_ln;
}
/*
int compare_d2 (const void *a, const void *b)
{
	switch( strcmp( ((D2 *)a)->name1, ((D2 *)b)->name1 ) ){
	case 1: return 1;
	case -1: return -1;
	case 0:
		return strcmp( ((D2 *)a)->name2, ((D2 *)b)->name2;
	}
}
int sort_d2(D2 **d2s_ptr, int len){
	qsort((*d2s_ptr), len, sizeof(D2), compare_d2);
}
*/


int write_d2(D2 *d2_ptr){
	printf("%s\t%s\n",
			d2_ptr->name1, d2_ptr->name2);
	return 1;
}

int write_d2s_file(char *file, D2 **d2s_ptr, int ln){
	FILE *fp;
	int i;
	if ((fp = fopen(file, "w")) == NULL){
		fprintf(stderr, "Coudn't open file %s\n",file);
		return -1;
	}
	for (i=0; i<ln; i++){
		fprintf(fp,"%s\t%s\n",
				((*d2s_ptr)[i]).name1, ((*d2s_ptr)[i]).name2);
	}
	fclose(fp);
	return 1;
}
int write_d2s_fp(FILE *fp, D2 **d2s_ptr, int ln){
	int i;
	for (i=0; i<ln; i++){
		fprintf(fp,"%s\t%s\n",
				((*d2s_ptr)[i]).name1, ((*d2s_ptr)[i]).name2);
	}
	return 1;
}

#endif
