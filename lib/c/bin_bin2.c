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
	boolean **tar_mat;
	NUM sum_val,bcgd_val;
	NUM *result;
	int result_count;
	int step;
	NUM res_val;
	char **files;
	files = (char **)malloc(1 * sizeof(char *));
	files[0] = (char *)malloc(MAX_FILE_NAME_LENGTH * sizeof(char));
	if (argc < 4) {
		fprintf(stderr, "Too few arguments!\n");
		fprintf(stderr, "net_file tar_file step sample_count\n");
		exit(EXIT_FAILURE);
	}
	strcpy(net_file,argv[1]);
	strcpy(tar_file,argv[2]);
	sample_count = atoi(argv[3]);
	strcpy(files[0],tar_file);
//	is_sample_avl changes here,
	read_avl_intersec_multi(files, 1, sample_count,
		&is_sample_avl, &avl_sample_count);
//	cal sum_val,
	sum_val = 
		read_bin_tar2(tar_file, sample_count, 
			&tar_mat);
	res_val = 
		cmp_bin2(net_file, tar_mat); 	//

	bcgd_val = 
		2 * sum_val / (avl_sample_count * (avl_sample_count - 1));
	printf("%f\t%f\t%d\n", bcgd_val, res_val, avl_sample_count);

	return 0;
}

