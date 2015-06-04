/* make a distribution from data
 * for block that are not equal sized
 * */
#ifndef _cal_dist
#define _cal_dist

#include "io.h"


void dist_init(long int **counts_ptr, double **cut_ptr,
	int bn, double stt, double end)
{
	int i;
	double step = (end-stt)/(double)bn;
	*cut_ptr = 
		(double *) malloc ((bn+1) * sizeof(double));
	*counts_ptr =
		(long int *) calloc (bn, sizeof(long int));
	
	for (i=0; i<bn+1; i++){
		(*cut_ptr)[i] = stt + step * (double)i;
	}
	if((*cut_ptr)[bn] != end)
		fprintf(stderr, "float error\n%f, %f\n",(*cut_ptr)[bn],end);
}

void dist_insert(double item, long int **counts_ptr, 
	double *cut)
{
	int i = 1;
	while (++i){
		if(item<cut[i]){
//			printf("++\n");
			(*counts_ptr)[i-1]++;
			break;
		}
	}
}
void dist_print_int(long int *counts, double *cut, int bn){
	int i;
	for (i=0; i<bn; i++){
		printf("%.0f\t%d\n",cut[i],counts[i]);
	}
}
void dist_print_double(long int *counts, double *cut, int bn){
	int i;
	for (i=0; i<bn; i++){
		printf("%.3f\t%d\n",cut[i],counts[i]);
	}
}

#endif
