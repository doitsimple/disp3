/* str to i */
#ifndef _st_si
#define _st_si

#include "io.h"
#define MAX_KEY_LEN 30
typedef struct _STRINT{
	char k[30];
	int v;
} STRINT;

void si_init(int max, STRINT **st_ptr, int *count){
	int i;
	*st_ptr = 
		(STRINT *) malloc (max * sizeof(STRINT));
	*count = 0;
}

void si_insert(char *key, STRINT **st_ptr, int *count)
{
	int j = (*count)++; 
//	printf("insert %s\t%d\n",key,*count);
	while (j>0 && strcmp(key, (*st_ptr)[j-1].k)==-1){
		strcpy((*st_ptr)[j-1].k, (*st_ptr)[j].k);
		j--; 
	}
	strcpy((*st_ptr)[j].k ,key);
}
void si_addvalue(STRINT **st_ptr, int *count){
	int i;
	for(i=0; i<*count; i++){
		(*st_ptr)[i].v = i;
	}
}
void si_insert_strint(STRINT item, STRINT **st_ptr, int *count)
{
	int j = (*count)++; 
//	printf("insert %s\t%d\n",key,*count);
	while (j>0 && strcmp(item.k, (*st_ptr)[j-1].k)==-1){
		strcpy((*st_ptr)[j-1].k, (*st_ptr)[j].k);
		(*st_ptr)[j-1].v = (*st_ptr)[j].v;
		j--; 
	}
	strcpy((*st_ptr)[j].k, item.k);
	(*st_ptr)[j].v = item.v;
}

int si_str_compareints (const void *a, const void *b)
{
	return strcmp( (*(STRINT*)a).k, (*(STRINT*)b).k );
}
/*
int int_d_compareints (const void *a, const void *b)
{
	return (*(STRINT*)a).v > (*(STRINT*)b).v ?1:0;;
}
int int_i_compareints (const void *a, const void *b)
{
	return (*(STRINT*)a).v < (*(STRINT*)b).v ?1:0;;
}
*/
int si_isearch(char *key, STRINT *st, int count){
	STRINT *pitem;
	STRINT titem;
	strcpy(titem.k,key);
	pitem = (STRINT*) bsearch (&titem, st, count, sizeof (STRINT), si_str_compareints);
	if(pitem == NULL)
		return -1;
	else
		return (*pitem).v;
}

STRINT si_select(int v, STRINT *st){
	return st[v];
}

int read_num_pfs (FILE *fp, COUNT row_num, COUNT col_num, 
	NUM_PF **num_pfs_ptr) {
	char line[MAX_LINE_SIZE]; 
	char *token; 
	int pf_i, pf_i2, col_i;
	*num_pfs_ptr = 
		(NUM_PF*) malloc (row_num * sizeof(NUM_PF)); 
	// skip the first line
	pf_i = 0; 
	while (fgets(line, sizeof(line), fp) != NULL){

		if ((token = strtok(line, "\t")) == NULL)
			break; 
		strncpy((*num_pfs_ptr + pf_i)->name, token, MAX_NAME_SIZE);
		(*num_pfs_ptr + pf_i)->pf = 
			( NUM* )malloc( (col_num-1)*sizeof(NUM) ); 
		for(col_i=0; col_i<col_num-1; col_i++){ 
			token = strtok(NULL, "\t\n");
			(*num_pfs_ptr + pf_i)->pf[col_i] = atof(token);
		}
//		(*num_pfs_ptr + pf_i)->dim = col_num-1;
		pf_i++;
	}
	return 0;
}

#endif
