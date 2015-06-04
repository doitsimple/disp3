
#ifndef _net_h
#define _net_h

#include "/home/zyp/db/lib/C/io.h"
#include "/home/zyp/db/lib/C/statistics.h"

void read_avl_intersec(char file1[], char file2[], int sample_count,
	int **is_sample_avl_ptr, int *avl_sample_count_ptr){
	char line[MAX_LINE_SIZE]; 
	char *token; 
	FILE *fp;
	int i,j;
	int samplei;

	*is_sample_avl_ptr =
		( int * ) malloc ( sample_count * sizeof(int) );
	for(samplei=0; samplei<sample_count; samplei++)
		(*is_sample_avl_ptr)[samplei]=0;

	if ((fp = fopen(file1, "r")) == NULL) {
		printf("Failure to open file %s!\n", file1);
		return;
	}
	while (fgets(line, sizeof(line), fp) != NULL ){
		if ((token = strtok(line, "\t")) == NULL)
			break; 
		i = atoi(token);
		if ((token = strtok(NULL, "\t\n")) == NULL)
			break; 
		j = atoi(token);
		(*is_sample_avl_ptr)[i]=1;
		(*is_sample_avl_ptr)[j]=1;
	}
//
	if ((fp = fopen(file2, "r")) == NULL) {
		printf("Failure to open file %s!\n", file2);
		return;
	}
	while (fgets(line, sizeof(line), fp) != NULL ){
		if ((token = strtok(line, "\t")) == NULL)
			break; 
		i = atoi(token);
		if ((token = strtok(NULL, "\t\n")) == NULL)
			break; 
		j = atoi(token);
		if((*is_sample_avl_ptr)[i]==1)
			(*is_sample_avl_ptr)[i]=2;
		if((*is_sample_avl_ptr)[j]==1)
			(*is_sample_avl_ptr)[j]=2;
	}

	*avl_sample_count_ptr=0;
	for(samplei=0; samplei<sample_count; samplei++)
		if ((*is_sample_avl_ptr)[samplei])
			(*avl_sample_count_ptr)++;
}
void read_avl_intersec_multi(char **files, int file_count, int sample_count,
	int **is_sample_avl_ptr, int *avl_sample_count_ptr){
	char line[MAX_LINE_SIZE]; 
	char *token; 
	FILE *fp;
	int i,j,filei;
	int samplei;

	*is_sample_avl_ptr =
		( int * ) malloc ( sample_count * sizeof(int) );
	for(samplei=0; samplei<sample_count; samplei++)
		(*is_sample_avl_ptr)[samplei]=0;

	for (filei = 0; filei < file_count; filei++){
		if ((fp = fopen(files[filei], "r")) == NULL) {
			printf("Failure to open file %s!\n", files[filei]);
			return;
		}
		while (fgets(line, sizeof(line), fp) != NULL ){
			if ((token = strtok(line, "\t")) == NULL)
				break; 
			i = atoi(token);
			if ((token = strtok(NULL, "\t\n")) == NULL)
				break; 
			j = atoi(token);
			(*is_sample_avl_ptr)[i]=1;
			(*is_sample_avl_ptr)[j]=1;
		}
	}
	//

	*avl_sample_count_ptr=0;
	for(samplei=0; samplei<sample_count; samplei++)
		if ((*is_sample_avl_ptr)[samplei])
			(*avl_sample_count_ptr)++;
}
NUM read_num_tar(char file[], int sample_count, int *is_sample_avl,
	NUM ***tar_mat_ptr, NUM *sumsq_ptr){
	char line[MAX_LINE_SIZE]; 
	char *token; 
	int i, j, col_i;
	FILE *fp;
	NUM sum_val;
	NUM val;
	int samplei;

	if ((fp = fopen(file, "r")) == NULL) {
		printf("Failure to open file %s!\n", file);
		return(-1);
	}
	*tar_mat_ptr = 
		(NUM**) malloc (sample_count * sizeof(NUM*)); 
	for(i=0; i<sample_count; i++)
		(*tar_mat_ptr)[i] = 
			(NUM*) malloc (sample_count * sizeof(NUM)); 
	for(i=0; i<sample_count; i++)
		for(j=0; j<sample_count; j++)
			(*tar_mat_ptr)[i][j]=0.0;

	sum_val=0.0;
	(*sumsq_ptr)=0.0;

	while (fgets(line, sizeof(line), fp) != NULL ){
		if ((token = strtok(line, "\t")) == NULL)
			break; 
		i = atoi(token);
		if (!is_sample_avl[i])
			continue;
		if ((token = strtok(NULL, "\t\n")) == NULL)
			break; 
		j = atoi(token);
		if (!is_sample_avl[j])
			continue;

		if((*tar_mat_ptr)[i][j] || (*tar_mat_ptr)[j][i] ){
			continue;
		}

		if ((token = strtok(NULL, "\t\n")) == NULL)
			break;
		val = atof(token);

		(*tar_mat_ptr)[i][j] = val;
		(*tar_mat_ptr)[j][i] = val;
		sum_val += val;
		(*sumsq_ptr) += val * val;
	}
	fclose(fp);
	return sum_val;
}
NUM read_bin_tar(char file[], int sample_count, int *is_sample_avl,
	boolean ***tar_mat_ptr){
	char line[MAX_LINE_SIZE]; 
	char *token; 
	int i, j, col_i;
	FILE *fp;
	NUM sum_val;
	NUM val;
	int samplei;

	if ((fp = fopen(file, "r")) == NULL) {
		printf("Failure to open file %s!\n", file);
		return(-1);
	}
	*tar_mat_ptr = 
		(boolean**) malloc (sample_count * sizeof(boolean*)); 
		
	for(i=0; i<sample_count; i++)
		(*tar_mat_ptr)[i] = 
			(boolean*) malloc (sample_count * sizeof(boolean)); 
	sum_val=0.0;
	for(i=0; i<sample_count; i++)
		for(j=0; j<sample_count; j++)
			(*tar_mat_ptr)[i][j]=0;

	while (fgets(line, sizeof(line), fp) != NULL ){
		if ((token = strtok(line, "\t")) == NULL)
			break; 
		i = atoi(token);
		if (!is_sample_avl[i])
			continue;
		if ((token = strtok(NULL, "\t\n")) == NULL)
			break; 
		j = atoi(token);
		if (!is_sample_avl[j])
			continue;

		if((*tar_mat_ptr)[i][j] || (*tar_mat_ptr)[j][i] ){
			continue;
		}

		(*tar_mat_ptr)[i][j] = 1;
		(*tar_mat_ptr)[j][i] = 1;
		sum_val += 1.0;
	}
	fclose(fp);
	return sum_val;
}
NUM read_bin_tar2(char file[], int sample_count, 
	boolean ***tar_mat_ptr){
	char line[MAX_LINE_SIZE]; 
	char *token; 
	int i, j, col_i;
	FILE *fp;
	NUM sum_val;
	NUM val;
	int samplei;

	if ((fp = fopen(file, "r")) == NULL) {
		printf("Failure to open file %s!\n", file);
		return(-1);
	}
	*tar_mat_ptr = 
		(boolean**) malloc (sample_count * sizeof(boolean*)); 
		
	for(i=0; i<sample_count; i++)
		(*tar_mat_ptr)[i] = 
			(boolean*) malloc (sample_count * sizeof(boolean)); 
	sum_val=0.0;
	for(i=0; i<sample_count; i++)
		for(j=0; j<sample_count; j++)
			(*tar_mat_ptr)[i][j]=0;

	while (fgets(line, sizeof(line), fp) != NULL ){
		if ((token = strtok(line, "\t")) == NULL)
			break; 
		i = atoi(token);
		if ((token = strtok(NULL, "\t\n")) == NULL)
			break; 
		j = atoi(token);

		if((*tar_mat_ptr)[i][j] || (*tar_mat_ptr)[j][i] ){
			continue;
		}

		(*tar_mat_ptr)[i][j] = 1;
		(*tar_mat_ptr)[j][i] = 1;
		sum_val += 1.0;
	}
	fclose(fp);
	return sum_val;
}
NUM cmp_bin2(char file[], boolean **tar_mat){
	char line[MAX_LINE_SIZE];
	char *token;
	int i, j, li;
	FILE *fp1;
	COUNT res_count;
	int res;
	NUM r,perc,ratio;

	if ((fp1 = fopen(file, "r")) == NULL) {
		printf("Failure to open file %s!\n", file);
		return(-1);
	}
	
	li=0;
	res_count=0;
	res=0.0;
	while (fgets(line, sizeof(line), fp1) != NULL) {
		li++;
		token = strtok(line, "\t");
		i =atoi(token); 
		token = strtok(NULL, "\t\n");
		j =atoi(token); 
/////////////////////////////////
		res += tar_mat[i][j];
		res_count ++;
	}
	fclose(fp1);
	return (NUM)res / (NUM)res_count;
}
NUM cmp_num(char file[], NUM **tar_mat, 
	int *is_sample_avl){
	char line[MAX_LINE_SIZE];
	char *token;
	int i, j, li;
	FILE *fp1;
	COUNT res_count;
	NUM res;
	NUM r,perc,ratio;

	if ((fp1 = fopen(file, "r")) == NULL) {
		printf("Failure to open file %s!\n", file);
		return(-1);
	}
	
	li=0;
	res_count=0;
	res=0.0;
	while (fgets(line, sizeof(line), fp1) != NULL) {
		li++;
		token = strtok(line, "\t");
		i =atoi(token); 
		if (!is_sample_avl[i])
			continue;
		token = strtok(NULL, "\t\n");
		j =atoi(token); 
		if (!is_sample_avl[j])
			continue;
/////////////////////////////////
		res += tar_mat[i][j];
		res_count ++;
	}
	fclose(fp1);
	return res / (NUM)res_count;
}
NUM cmp_bin_by_row(char file[], boolean **tar_mat, 
	int *is_sample_avl, int step,
	NUM **result_ptr, int *result_count_ptr){
	char line[MAX_LINE_SIZE];
	char *token;
	int i, j, li;
	FILE *fp1;
	COUNT res_count;
	int res;
	NUM r,perc,ratio;
	int cut;

	if ((fp1 = fopen(file, "r")) == NULL) {
		printf("Failure to open file %s!\n", file);
		return(-1);
	}
	
	*result_count_ptr=0;
	li=0;
	cut=step;
	res_count=0;
	res=0;
	*result_ptr = 
		(NUM*) malloc (1 * sizeof(NUM));
	while (fgets(line, sizeof(line), fp1) != NULL) {
		li++;
		token = strtok(line, "\t");
		i =atoi(token); 
		if (!is_sample_avl[i])
			continue;
		token = strtok(NULL, "\t\n");
		j =atoi(token); 
		if (!is_sample_avl[j])
			continue;
/////////////////////////////////
		res += tar_mat[i][j];
		res_count ++;
		if(res_count==cut){
			(*result_count_ptr) ++;
			perc = (NUM)res / (NUM)res_count;
			*result_ptr = 
				(NUM*) realloc (*result_ptr, *result_count_ptr * sizeof(NUM));
			(*result_ptr)[*result_count_ptr - 1] = perc;
			cut+=step;
		}
	}
	fclose(fp1);
	return (NUM)res / (NUM)res_count;
}
NUM cmp_num_by_row(char file[], NUM **tar_mat, 
	int *is_sample_avl, int step,
	NUM **result_ptr, int *result_count_ptr){
	char line[MAX_LINE_SIZE];
	char *token;
	int i, j, li;
	FILE *fp1;
	COUNT res_count;
	NUM res;
	NUM r,perc,ratio;
	int cut;

	if ((fp1 = fopen(file, "r")) == NULL) {
		printf("Failure to open file %s!\n", file);
		return(-1);
	}
	
	*result_count_ptr=0;
	li=0;
	cut=step;
	res_count=0;
	res=0.0;
	*result_ptr = 
		(NUM*) malloc (1 * sizeof(NUM));
	while (fgets(line, sizeof(line), fp1) != NULL) {
		li++;
		token = strtok(line, "\t");
		i =atoi(token); 
		if (!is_sample_avl[i])
			continue;
		token = strtok(NULL, "\t\n");
		j =atoi(token); 
		if (!is_sample_avl[j])
			continue;
/////////////////////////////////
		res += tar_mat[i][j];
		res_count ++;
		if(res_count==cut){
			(*result_count_ptr) ++;
			perc = res / (NUM)res_count;
			*result_ptr = 
				(NUM*) realloc (*result_ptr, *result_count_ptr * sizeof(NUM));
			(*result_ptr)[*result_count_ptr - 1] = perc;
			cut+=step;
		}
	}
	fclose(fp1);
	return res / (NUM)res_count;
}
NUM cmp_num_by_val(char file[], NUM **tar_mat, 
	int *is_sample_avl, int step,
	NUM **result_ptr, int *result_count_ptr){
	char line[MAX_LINE_SIZE];
	char *token;
	int i, j, li;
	FILE *fp1;
	COUNT res_count;
	NUM res;
	NUM r,perc,ratio;
	int cut;

	if ((fp1 = fopen(file, "r")) == NULL) {
		printf("Failure to open file %s!\n", file);
		return(-1);
	}
	
	*result_count_ptr=0;
	li=0;
	cut=step;
	res_count=0;
	res=0.0;
	*result_ptr = 
		(NUM*) malloc (1 * sizeof(NUM));
	while (fgets(line, sizeof(line), fp1) != NULL) {
		li++;
		token = strtok(line, "\t\n");
		i =atoi(token); 
		if (!is_sample_avl[i])
			continue;
		token = strtok(NULL, "\t\n");
		j =atoi(token); 
		if (!is_sample_avl[j])
			continue;
		token = strtok(NULL, "\t\n");
		r =atof(token); 
/////////////////////////////////
		res += tar_mat[i][j];
		res_count ++;
		if(res_count==cut){
			(*result_count_ptr) ++;
			perc = res / (NUM)res_count;
			*result_ptr = 
				(NUM*) realloc (*result_ptr, *result_count_ptr * sizeof(NUM));
			(*result_ptr)[*result_count_ptr - 1] = perc;
			cut += step;
		}
	}
	fclose(fp1);
	return res / (NUM)res_count;
}
#endif

