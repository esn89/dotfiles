#include <cmath>
#include <cstdio>
using namespace std;

// find a duplicate in an array of size n.  with numbers
// from 0 to n-1

int finddupe(int *array, int size) {

	if (size < 1) return -1;

	for (int i = 0; i < size; i++) {
		//printf("%d ", array[i]);
		int temp = array[i];
		temp = abs(temp);
		if (array[temp] < 0) {
			return abs(array[i]);
		} else {
			array[array[i]] = array[array[i]] * -1;
		}
	}
	return -1;
}

int main() {

	//int array[6] = {0, 1, 2, 3, 4, 5};
	int array2[6] = {2, 4, 1, 3, 2, 5};
	printf("%d\n", finddupe(array2, 6));


	return 0;
}



