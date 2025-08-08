class MatrixHelper{
    static reverseColumns(arr)
    {
        let t
        let C=arr[0].length
        let R=arr.legnth
        for (let i = 0; i < C; i++) {
            for (let j = 0, k = C - 1; j < k; j++, k--) {
                t = arr[j][i];
                arr[j][i] = arr[k][i];
                arr[k][i] = t;
            }
        }
    }
      
    // Function for transpose of matrix
    static transpose(arr)
    {
        let C=arr[0].length
        let R=arr.legnth
        for (let i = 0; i < R; i++) {
            for (let j = i; j < C; j++) {
                t = arr[i][j];
                arr[i][j] = arr[j][i];
                arr[j][i] = t;
            }
        }
    }
      
    // Function for display the matrix
    static printMatrix(arr)
    {
        let C=arr[0].length
        let R=arr.legnth
        for (let i = 0; i < R; i++) {
            for (let j = 0; j < C; j++)
                document.write(arr[i][j] + " ");
            document.write("<br>");
        }
    }
      
    // Function to anticlockwise
    // rotate matrix by 180 degree
    static rotate180(arr)
    {
        this.transpose(arr);
        this.reverseColumns(arr);
        this.transpose(arr);
        this.reverseColumns(arr);
    }

}
module.exports = {MatrixHelper}