#include "/home/zyp/db/lib/C/io.h"
#include "/home/zyp/db/lib/C/statistics.h"

int main(int argc, char *argv[]) {
	char net_file[MAX_FILE_NAME_LENGTH];
	int i,j;
	FILE *fp;
	char *token;
	char line[MAX_LINE_SIZE];
	MN2F *net;
	int ln;
	int percent;
	if (argc < 2) {
		fprintf(stderr, "Too few arguments!\n");
		fprintf(stderr, "net_file \n");
		exit(EXIT_FAILURE);
	}
	strcpy(net_file,argv[1]);
	percent=atoi(argv[2]);

	ln=wc_l(net_file);

	if ((fp = fopen(net_file, "r")) == NULL){
		fprintf(stderr, "Coudn't open file %s; \n", net_file);
		return -1;
	}
	read_mn2f(fp, ln, &net);
	fclose(fp);
	sort_mn2f_d(&net, ln);
	print_file_mn2f(net_file, net, ln * percent / 100 ) ;
	return 0;
}

