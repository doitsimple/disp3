#include "/home/zyp/db/lib/C/io.h"
#include "/home/zyp/db/lib/C/statistics.h"
#include "../net.h"

int main(int argc, char *argv[]) {
	char net_file[MAX_FILE_NAME_LENGTH];
	char tar_file[MAX_FILE_NAME_LENGTH];
	int i,j;
/*	
	FILE *fp1;
	char *token;
	char line[MAX_LINE_SIZE];
*/	
	int sample_count;
	int *is_sample_avl;
	int avl_sample_count;
	NUM **tar_mat;
	NUM sum_val,bcgd_val;
	NUM *result;
	int result_count;
	int step;
	NUM res_val;
	NUM sumsq_val, len, std, z;
	if (argc < 5) {
		fprintf(stderr, "Too few arguments!\n");
		fprintf(stderr, "net_file tar_file step sample_count\n");
		exit(EXIT_FAILURE);
	}
	strcpy(net_file,argv[1]);
	strcpy(tar_file,argv[2]);
	step = atoi(argv[3]);
	sample_count = atoi(argv[4]);

//	is_sample_avl changes here,
	read_avl_intersec(tar_file, net_file, sample_count,
		&is_sample_avl, &avl_sample_count);
//	cal sum_val,
	sum_val = 
		read_num_tar(tar_file, sample_count, is_sample_avl, 
			&tar_mat, &sumsq_val);
	res_val = 
		cmp_num_by_row(net_file, tar_mat, is_sample_avl, step,
			&result, &result_count); 	//

	len = (NUM)(avl_sample_count * (avl_sample_count - 1)) / 2.0;
	bcgd_val = sum_val / len;
//	std	=
//		sqrt(sumsq_val / (len-1.0) - (sum_val * sum_val) / (len * (len-1.0)));
//	z = 
//		(res_val - bcgd_val) / std;
	fprintf(stderr,"%f\t%f\t%d\n", bcgd_val, res_val, avl_sample_count);
//	fprintf(stderr,"%f\t%f\n", z, std);
	for (i = 0; i < (result_count-1); i++)
		printf("%d\t%f\n", (i+1)*step, result[i]);

	return 0;
}

