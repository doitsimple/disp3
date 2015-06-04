/* string to N */
#ifndef _st_sn
#define _st_sn

#include "io.h"
#define MAX_KEY_LEN 30

void sn_init(int max, char ***st_ptr, int *count){
	int i;
	*st_ptr = 
		(char **) malloc (max * sizeof(char *));
	for(i=0; i<max; i++)
		(*st_ptr)[i] = 
			(char *) malloc (MAX_KEY_LEN * sizeof(char)); 
	*count = 0;
}

void sn_insert(char *key, char ***st_ptr, int *count)
{
	int j = (*count)++; 
//	printf("insert %s\t%d\n",key,*count);
	while (j>0 && strcmp(key, (*st_ptr)[j-1])==-1){ 
		strcpy((*st_ptr)[j-1], (*st_ptr)[j]);
		j--; 
	}
	strcpy((*st_ptr)[j],key); 
}

int sn_str_compareints (const void *a, const void *b)
{
	return strcmp( *(char**)a, *(char**)b );
}
boolean sn_bsearch(char *key, char **st, int count){
	int *pitem;
	pitem = (int*) bsearch (&key, st, count, sizeof (char*), sn_str_compareints);
	if(pitem != NULL)
		return 1;
	return 0;
}

int sn_isearch(char *key, char **st, int count)
{
	int j = count; 
	while (j>0 && strcmp(key, st[j-1])==-1){
		j--;
	}
	if(strcmp(key, st[j-1])==0){
		return j-1;
	}
	return -1;
}

char* sn_select(int v, char **st){
	return st[v];
}

#endif
