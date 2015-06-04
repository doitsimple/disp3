/*
# Template       : Last modified data 02/20/12
# Author         : SetupX
 */

#ifndef _net_mn
#define _net_mn

#include <stdio.h>
#include <stdlib.h> //itoa
#include <string.h> //strcpy ...
#include <errno.h>

#define MAX_LINE_SIZE 1000
#define MAX_FILE_NAME_SIZE 100
#define MN_NAME_LENGTH 100

extern char *program_invocation_short_name;
typedef struct _MN2I{	
	char m[15];
	char n[15];
	int i;
} MN2I;
int mn2icpy(MN2I *t_mn2i_ptr, MN2I *mn2i_ptr){
	strcpy (t_mn2i_ptr->m,mn2i_ptr->m);
	strcpy (t_mn2i_ptr->n,mn2i_ptr->n);
	t_mn2i_ptr->i = mn2i_ptr->i;
	return 1;
}
int read_mn2i_line(char *line, MN2I *mn2i_ptr){
	char *token;
	if ((token = strtok(line, "\t")) == NULL)
		return 0;
	strcpy(mn2i_ptr->m,token);

	if ((token = strtok(NULL, "\t\n")) == NULL)
		return 0;
	strcpy(mn2i_ptr->n,token);

	if ((token = strtok(NULL, "\t\n")) == NULL){
		mn2i_ptr->i=0;
		return 1;
	}
	mn2i_ptr->i=atoi(token);
	return 1;
}
int read_mn2i_fp(FILE *fp, MN2I *mn2i_ptr){
	char line[MAX_LINE_SIZE];
	if(fgets(line, sizeof(line), fp) != NULL) {
		read_mn2i_line(line,mn2i_ptr);
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

int read_mn2i_file(char *file, MN2I **mn2is_ptr){
	FILE *fp;
	char line[MAX_LINE_SIZE];
	int ln,max_ln,i;

	max_ln=wc_l(file);
	if ((fp = fopen(file, "r")) == NULL){
		fprintf(stderr, "Coudn't open file %s\n",file);
		return -1;
	}
	*mn2is_ptr = 
		(MN2I*)malloc(max_ln * sizeof(MN2I));

	ln=0;
	while (fgets(line, sizeof(line), fp) != NULL) {
		read_mn2i_line(line,&(*mn2is_ptr)[ln]);
		ln++;
	}
	fclose(fp);
	return max_ln;
}

int compare_mn2i (const void *a, const void *b)
{
	switch( strcmp( ((MN2I *)a)->m, ((MN2I *)b)->m ) ){
	case 1: return 1;
	case -1: return -1;
	case 0:
		switch( strcmp( ((MN2I *)a)->n, ((MN2I *)b)->n ) ){
		case 1: 	return 1;
		case -1:	return -1;
		case 0:
							return ((MN2I *)a)->i > ((MN2I *)b)->i ? 1 : -1;
		}
	}
}
int sort_mn2i(MN2I **mn2is_ptr, int len){
	qsort((*mn2is_ptr), len, sizeof(MN2I), compare_mn2i);
}

int write_mn2i(MN2I *mn2i_ptr){
	printf("%s\t%s\t%d\n",
			mn2i_ptr->m, mn2i_ptr->n, mn2i_ptr->i);
	return 1;
}

int write_mn2is_file(char *file, MN2I **mn2is_ptr, int ln){
	FILE *fp;
	int i;
	if ((fp = fopen(file, "w")) == NULL){
		fprintf(stderr, "Coudn't open file %s\n",file);
		return -1;
	}
	for (i=0; i<ln; i++){
		fprintf(fp,"%s\t%s\t%d\n",
				((*mn2is_ptr)[i]).m, ((*mn2is_ptr)[i]).n, ((*mn2is_ptr)[i]).i);
	}
	fclose(fp);
	return 1;
}
int write_mn2is_fp(FILE *fp, MN2I **mn2is_ptr, int ln){
	int i;
	for (i=0; i<ln; i++){
		fprintf(fp,"%s\t%s\t%d\n",
				((*mn2is_ptr)[i]).m, ((*mn2is_ptr)[i]).n, ((*mn2is_ptr)[i]).i);
	}
	return 1;
}

#endif
