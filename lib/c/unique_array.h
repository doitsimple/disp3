/* unique array */
#ifndef _unique_array
#define _unique_array

#include "io.h"



void ua_insert(int i, int j, BIN_ARR **st_ptr)
{
	int n=(*st_ptr)[i].n++;
	while (n>0 && j<(*st_ptr)[i].v[n-1]){
		(*st_ptr)[i].v[n] = (*st_ptr)[i].v[n-1];
		n--;
	}
	(*st_ptr)[i].v[n]=j;
}


int ni2b_int_compareints (const void *a, const void *b)
{
//	printf("cmp%d\t%d\n",*(int*)a,*(int*)b);
	return *(int*)a > *(int*)b ? 1 : *(int*)a==*(int*)b ? 0 : -1;
}
boolean ni2b_bsearch(int i, int j, BIN_ARR *st){
//	printf("test%d\t%d\n",i,j);
	int *pitem;
	pitem = (int *) bsearch (&j, st[i].v, st[i].n,
		sizeof (int), ni2b_int_compareints);
	if(pitem != NULL)
		return 1;
	return 0;
}

BIN_ARR ni2b_select(int i, BIN_ARR *st){
	return st[i];
}

void ni2b_print(int max, BIN_ARR *st)
{
	int i,j;
	for (i=0; i<max; i++){
		printf("%d",i);
		for (j=0; j<st[i].n; j++)
			printf("\t%d",st[i].v[j]);
		printf("\n");
	}
}

int read_ni2b(char *file, int max, BIN_ARR **st_ptr){
	FILE *fp;
	char line[MAX_LINE_SIZE];
	COUNT line_num;
	char *token;
	int i,j;
	ni2b_init_file(file, max, st_ptr);

	if ((fp = fopen(file, "r")) == NULL){
		fprintf(stderr, "%s: Coudn't open file %s; %s\n",
			program_invocation_short_name, file, strerror(errno) );
		return -1;
	}
	while (fgets(line, sizeof(line), fp) != NULL ) {
		if ((token = strtok(line, "\t")) == NULL)
			break;
		i = atoi(token);
		if ((token = strtok(NULL, "\t\n")) == NULL)
			break;
		j = atoi(token);
		ni2b_insert(i, j, st_ptr);
//		printf("%d\t%d\n",i,j);
//		ni2b_print(6, *st_ptr);
	}
	fclose(fp);
	return 0;
}
int read_ni2b_reverse(char *file, int max, BIN_ARR **st_ptr){
	FILE *fp;
	char line[MAX_LINE_SIZE];
	COUNT line_num;
	char *token;
	int i,j;
	ni2b_init_file_reverse(file, max, st_ptr);
//	printf("xxxxx\n");
	if ((fp = fopen(file, "r")) == NULL){
		fprintf(stderr, "%s: Coudn't open file %s; %s\n",
			program_invocation_short_name, file, strerror(errno) );
		return -1;
	}
	while (fgets(line, sizeof(line), fp) != NULL ) {
		if ((token = strtok(line, "\t")) == NULL)
			break;
		i = atoi(token);
		if ((token = strtok(NULL, "\t\n")) == NULL)
			break;
		j = atoi(token);
		ni2b_insert(j, i, st_ptr);
//		ni2b_print(6, *st_ptr);
	}
//		printf("%d\t%d\n",i,j);
	fclose(fp);
	return 0;
}
int intersec_2ba(BIN_ARR *ba1, BIN_ARR *ba2){
	int i,j,r;
	i=0;
	j=0;
	r=0;
//		printf("%d\t%d\n",ba1->n,ba2->n);
	while (i<ba1->n && j<ba2->n){
		if(ba1->v[i] < ba2->v[j]){
			i++;
		}
		else if(ba1->v[i] > ba2->v[j]){
			j++;
		}
		else{
			i++;
			j++;
			r++;
		}
	}
//		printf("%d\t%d\n",i,j);
	return r;
}
#endif
