#include <stdio.h> 
#include <stdlib.h>
#include <string.h>
#include <math.h>

#define PATH "/home/zyp/db/data/chr_seq/ori_seq/"

#define MAX_CHR_LENGTH 300000000
#define MAX_LINE_LENGTH 50
#define MAX_LINE_NUM MAX_CHR_LENGTH/MAX_LINE_LENGTH

#define MAX_ORF_NAME 400


char rev(char nt){
	if (nt=='a')
		return 't';
	if (nt=='c')
		return 'g';
	if (nt=='g')
		return 'c';
	if (nt=='t')
		return 'a';
	if (nt=='A')
		return 'T';
	if (nt=='C')
		return 'G';
	if (nt=='G')
		return 'C';
	if (nt=='T')
		return 'A';
	if (nt=='N')
		return 'N';
}

int main (int argc, char *argv[]) { 

	if (argc < 2) { 
		printf ("Please specify input file\n"); 
		return (0);
	}
	int i,j,k,m;
	int start_pos,end_pos,new_pos;
	char strand,nt;
	char current_chr[12]="chr";
	char in_file[100],chr_file[100];	//file name
	char org[50];
	char name[50];
	int line_num, row_num; 
	char line[80],line2[80],*token; //for reading file
	char ***in, **chr; //for store input file and chrom file
	char mark[4]; //>
	strcpy(mark, ">");

	FILE *IN,*fp;

	strcpy(in_file,argv[1]);
	strcpy(org,argv[2]);
	
//	//count row number and line number of the input file	
	if ((IN = fopen(in_file, "r")) == NULL) {
		printf("can't open %s",in_file);
		return -1;
	}

	line_num=0;
	while (fgets(line, sizeof(line), IN) != NULL) {
		row_num=0;
		if(token = strtok(line,"\t")){;
			row_num++;
		}
		while ( (token = strtok(NULL, "\t")) != NULL ) {
			row_num++;
		}
		line_num++;
	}
	fclose(IN);


//	//malloc memory space accoding to row and line num
	in=(char ***) malloc(line_num * sizeof(char **));
	for(i=0;i<line_num;i++){
		in[i]=(char **) malloc(row_num * sizeof(char *));
	}
	//read input file 
	if ((IN = fopen(in_file, "r")) == NULL) {
		printf("can't open %s",in_file);
		return -1;
	}
	line_num=0;
	while (fgets(line, sizeof(line), IN) != NULL) {
		row_num=0;
		if(token = strtok(line,"\t") ){
			in[line_num][row_num] =(char *)malloc(20*sizeof(char));
			strcpy(in[line_num][row_num], token);
			row_num++;
		}
		while ( (token = strtok(NULL, "\t")) != NULL ) {
			in[line_num][row_num] =(char *)malloc(20*sizeof(char));
			strcpy(in[line_num][row_num], token);
			row_num++;
		}
		line_num++;
	}

	fclose(IN);

//	//find the lines belong to the same chromsome
	chr=(char **) malloc(MAX_LINE_NUM * sizeof(char*));
	for(i=0; i<MAX_LINE_NUM; i++)
		chr[i] = (char *) malloc(MAX_LINE_LENGTH +1 * sizeof(char));

	for(j=0; j<=line_num-1; j++){
		if(strcmp(current_chr,in[j][0]) != 0){
			strcpy(current_chr,in[j][0]);
			strcpy(chr_file, PATH); 
			strcat(chr_file, org); 
			strcat(chr_file, "/"); 
			strcat(chr_file, current_chr); 
			strcat(chr_file, ".fa"); 

			//read chromsome
			if ((fp = fopen(chr_file, "r")) == NULL) { 
				printf ("cannot open chr_file %s\n", chr_file); 
				return (-1); 
			} 
			k = 0; 
			while (fgets(line2, sizeof(line2), fp) != NULL) { 
				token = strtok(line2, "\n"); 
				if (token == NULL) {continue;}
				if (k > 0) {
					strcpy(chr[k - 1], token); 
				}
				k++;
			}
			fclose(fp); 
		}
//print result to STDOUT
		start_pos=atoi(in[j][1]);
		end_pos=atoi(in[j][2]);
		strcpy(name,in[j][3]);
		strand=atoi(in[j][5]);
		
		printf(">%s\n",name);
		if (strand != '-') {
			for (i = start_pos; i < end_pos; i ++) { 
				m = (int) i/MAX_LINE_LENGTH ; 
				new_pos = i - m * MAX_LINE_LENGTH; 
				nt = chr[m][new_pos]; 
				printf ("%c",nt);
			}
		}
		else {
			for (i = end_pos; i > start_pos; i--) {
				m = (int) (i-1)/MAX_LINE_LENGTH ;
				new_pos = i - m * MAX_LINE_LENGTH - 1;
				nt = chr[m][new_pos];
				nt = rev(nt);
				printf ("%c",nt);
			}
		}
		printf ("\n"); 

	}

	return 1; 
}






