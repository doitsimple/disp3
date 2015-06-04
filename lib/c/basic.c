/*
# Descriptions   : 
# Usage          : 
# Parameters	 : none
# Sample Input   : 
# Sample Output  : 
# Depedency      : none
# Temp File      : none
# Comments       : none
# See Also       : none
# Data           : 
# Template       : Last modified date 11/16/10
# Author         : setupX
*/

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>
#include <limits.h>
#include "../../../C/io.h"
#include "../../../C/mat.h"
#include "../../../C/statistics.h"
#include "../../../C/hyper_dist.h"

int main(int argc, char *argv[]){
	FILE *fp;
	char line[100];
	char query_file[30];
	char anno_file[30];
	char map_file_sample[30];
	char map_file_attr[30];
	int ln, i, j;
	char *token;
	char **sample_name, **attr_name;
	int *query, query_size;
	BMAT anno;
	int attr_size,fd_t;
	int fa,fb,fc,fd;
	i2f *pv_rank;


	strcpy(query_file,argv[1]);
	strcpy(anno_file,argv[2]);
	strcpy(map_file_sample,argv[3]);
	strcpy(map_file_attr,argv[4]);

	read_anno(anno_file, map_file_sample, map_file_attr, 
		&anno, &sample_name, &attr_name);

	query_size=read_query(query_file, &query);
	fd_t = attr_sample_num-query_size;
	for(j=0;j<anno.attr_num;j++){
		attr_size=anno.attr_sample_num[j];
		fa=0;
		for (i=0;i<query_size;i++){
			if(anno.elements[i][j])
				fa++;
		}
		if(fa==0)
			continue;
		fb=query_size-fa;
		fc=attr_size-fa;
		fd=fd_t-fc+fa;
		pv_rank[j].f=fisher_test(fa,fb,fc,fd,1);	//the p-value
		pv_rank[j].i=j;	//the attr index
	}
	sort_i2f_d(&pv_rank,j);
	print_i2f_d(&pv_rank,j);
	return 1;
}
