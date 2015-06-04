/* input for machine learning */


#ifndef _mat
#define _mat

#include "io.h"


typedef struct _BMAT{	//record binary matrix data
	COUNT attr_num;
	COUNT sample_num;
	COUNT entry_num;

	COUNT *sample_attr_num;

	COUNT *attr_sample_num;
//	COUNT **attr_sample_index;

	boolean **elements;
} BMAT;

int read_index(char *file, int line_num, char ***strs_ptr){
	FILE *fp;
	char line[MAX_LINE_SIZE];
	char *token;
	int i;
	if ((fp = fopen(file, "r")) == NULL){
		fprintf(stderr, "Coudn't open file %s\n",file);
		return -1;
	}
  read_str_list (fp, line_num, strs_ptr);
	fclose(fp);
	return 1;
}
int alloc_bmat(int line_num, int row_num, 
	BMAT *bmat_ptr){
	int i,j;
	bmat_ptr->sample_num=line_num;
	bmat_ptr->attr_num=row_num;

	bmat_ptr->sample_attr_num =
		(int*) malloc(line_num * sizeof(int));
	bmat_ptr->attr_sample_num =
		(int*) malloc(row_num * sizeof(int));
//	bmat_ptr->attr_sample_index =
//		(int**) malloc(row_num * sizeof(int*));
	bmat_ptr->elements =
		(boolean**) malloc(line_num * sizeof(boolean *));

	for(i=0; i<line_num; i++){
		bmat_ptr->sample_attr_num[i]=0;
		bmat_ptr->elements[i] = 
			(boolean *) malloc(row_num * sizeof(boolean));
		for(j=0; j<row_num; j++){
			bmat_ptr->elements[i][j]=0;
		}
	}
	for(j=0; j<row_num; j++)
		bmat_ptr->attr_sample_num[j]=0;
	return 1;
}
int read_binary_mat(char *file, int line_num, int row_num, BMAT *bmat_ptr){
	FILE *fp;
	char line[MAX_LINE_SIZE];
	char *token;
	int i, j;
	alloc_bmat(line_num, row_num, bmat_ptr);

	if ((fp = fopen(file, "r")) == NULL){
		fprintf(stderr, "Coudn't open file %s\n",file);
		return -1;
	}
	bmat_ptr->entry_num=0;
	while(fgets(line, sizeof(line), fp) != NULL
			&& line[0] != '\r' && line[0] != '\0') {
		if ( (token = strtok(line, "\t")) == NULL ) 
			break;
		i=atoi(token);
		if ( (token = strtok(NULL, "\t\n")) == NULL )
			break;
		j=atoi(token);
		if(i>=line_num || j>=row_num)
			fprintf(stderr, "File %s has unmapped index: %s \n\
				\t%d %d\n",
				file, i, j);
		if(bmat_ptr->elements[i][j])
			fprintf(stderr, "File %s has lines of repeat content:\n\
					\t%d %d %d\n",
					file, i, j, bmat_ptr->elements[i][j]);
		bmat_ptr->entry_num++;
		bmat_ptr->sample_attr_num[i]++;
		bmat_ptr->attr_sample_num[j]++;
		bmat_ptr->elements[i][j]=TRUE;
	}
	fclose(fp);
	return 1;
}
int read_anno(char *anno_file, char *map_file_sample, char *map_file_attr,
	BMAT *bmat_ptr, char ***sample_name_ptr, char ***attr_name_ptr){
	int line_num,row_num;
	line_num=wc_l(map_file_sample);
	row_num=wc_l(map_file_attr);
	read_index(map_file_sample, line_num, sample_name_ptr);
	read_index(map_file_attr, row_num, attr_name_ptr);
	read_binary_mat(anno_file, 
		line_num,	row_num, bmat_ptr);
	return 1;
}
#endif
