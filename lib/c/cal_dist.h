/* make a distribution from data*/
#ifndef _cal_dist
#define _cal_dist

#include "io.h"

typedef struct _DIST{
	long int *counts;
	long int count_all;
	int bn;
	double stt;
	double end;
	double scale;
	double step;
	long int sum;
} DIST;

void dist_init(DIST *dist_ptr,
	int bn, double stt, double end)
{
	int i;
	dist_ptr->counts =
		(long int *) calloc (bn, sizeof(long int));
	dist_ptr->bn = bn;
	dist_ptr->stt = stt;
	dist_ptr->end = end;
	dist_ptr->scale = end - stt;
	dist_ptr->step = (end - stt)/(double)bn;
	dist_ptr->count_all = 0;
	dist_ptr->sum = 0;
}
void dist_insert(double item, DIST *dist_ptr)
{
	dist_ptr->counts[(int) ((item - dist_ptr->stt) * dist_ptr->bn / dist_ptr->scale)]++;
	dist_ptr->count_all++;
	dist_ptr->sum+=(int)(item*1000.0);
}
void dist_print_int(DIST dist){
	int i;
	for (i=0; i<dist.bn; i++){
		printf("%.0f\t%d\n",dist.stt+dist.step*(double)i, dist.counts[i]);
	}
}
void dist_print_double(DIST dist){
	int i;
	printf("#mean\t%.3f\n",
		(double)dist.sum/(double)dist.count_all/1000.0);
	for (i=0; i<dist.bn; i++){
		printf("%.3f\t%d\n",dist.stt+dist.step*(double)i, dist.counts[i]);
	}
}
int dist_print_file_double(char *file, DIST dist){
	int i;
	FILE *fp;
	if ((fp = fopen(file, "w")) == NULL){
		fprintf(stderr, "%s: Coudn't open file %s to write; %s\n",
			program_invocation_short_name, file, strerror(errno) );
		return -1;
	}
	fprintf(fp,"#mean\t%.3f\n", 
		(double)dist.sum/(double)dist.count_all/1000.0);
	for (i=0; i<dist.bn; i++){
		fprintf(fp,"%.3f\t%d\n",dist.stt+dist.step*(double)i, dist.counts[i]);
	}
	fclose(fp);
	return 0;
}
#endif
