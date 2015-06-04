/*
# Template       : Last modified data 02/20/12
# Author         : SetupX
 */

#ifndef _h
#define _h

#include "../../C/io.h"

void cal_auc(I2F *result_stat_ptr, 
	FILE *roc_fp, FILE *prc_fp)
{

	NUM auc_roc=0.0;
	NUM auc_prc=0.0;
	NUM precision_1,precision_2,recall_1,recall_2;
	NUM tpr_1,tpr_2,fpr_1,fpr_2;
	NUM last_val;

	NUM *val;

	COUNT i,j;
//	all true
	COUNT c11, c01, c10, c00, cx0, c1x, cx1;
	c11=0;
	c01=0;
	c10=0;
	c00=0;
	for(i=0; i<result.sample_num; i++)		
		if(target_mat.elements[i][curr_target_i])
			c11++;
		else
			c10++;	
//	printf("%d\t%d\t%d\t%d\n",c00,c01,c10,c11);
	cx0=c10;
	cx1=c11;
	precision_1 = (NUM)c11 / ( (NUM)c10 + (NUM)c11 );
	recall_1 = (NUM)c11 / (NUM)cx1;
	tpr_1 = recall_1;
	fpr_1 = (NUM)c10 / (NUM)cx0;
	fprintf(roc_fp, "%f\t%f\t0.000000\n", fpr_1, tpr_1);
	fprintf(prc_fp, "%f\t%f\t0.000000\n", recall_1, precision_1);
//	val is the series of cutoff
	val =
		(NUM *)malloc(result.sample_num * sizeof(NUM));
	for(i=0; i<result.sample_num; i++)
		val[ result.i2f[i].i ]=result.i2f[i].f;

	qsort(val, result.sample_num, sizeof(NUM), compare_num_u);
	
	last_val=-1.0;
	for(j=0; j<result.sample_num; j++){
		if(val[j] == last_val)
			continue;
		last_val=val[j];
		for(i=0; i<result.sample_num; i++){
			if(val[j] == result.i2f[i].f){
				if(target_mat.elements[i][curr_target_i]){
					c11--;
					c01++;
				}
				else{
					c10--;
					c00++;
				}
			}
		}
//		printf("%d\t%d\t%d\t%d\n",c00,c01,c10,c11);
		if(!c10 && !c11)
			precision_2=precision_1;
		else	
			precision_2 = (NUM)c11 / ( (NUM)c10 + (NUM)c11 );
		recall_2 = (NUM)c11 / (NUM)cx1;
		tpr_2 = recall_2;
		fpr_2 = (NUM)c10 / (NUM)cx0;
		fprintf(roc_fp, "%f\t%f\t%f\n", fpr_2, tpr_2, val[j]);
		fprintf(prc_fp, "%f\t%f\t%f\n", recall_2, precision_2, val[j]);

		auc_roc += (fpr_1-fpr_2)*(tpr_1+tpr_2);
		auc_prc += (recall_1-recall_2)*(precision_1+precision_2);

		precision_1 = precision_2;
		recall_1 = recall_2;
		tpr_1 = tpr_2;
		fpr_1 = fpr_2;
	}
	auc_roc/=2.0;
	auc_prc/=2.0;
	result_stat_ptr->auc_roc=auc_roc;
	result_stat_ptr->auc_prc=auc_prc;
	free(val);
}
#endif
